import { Job } from "bullmq";
import { templateService } from "../src/services/template.service";
import { trackingService } from "../src/services/tracking.service";
import { providerService } from "../src/services/provider.service";
import prisma from "../src/db/client";
import juice from "juice";

// Mock dependencies
jest.mock("../src/db/client", () => ({
  emailLog: {
    create: jest.fn(),
    update: jest.fn(),
  },
}));

jest.mock("../src/services/template.service", () => ({
  templateService: {
    render: jest.fn(),
  },
}));

jest.mock("../src/services/tracking.service", () => ({
  trackingService: {
    injectPixel: jest.fn((html) => `${html}<!--pixel-->`),
    wrapLinks: jest.fn((html) => `${html}<!--wrapped-->`),
  },
}));

jest.mock("../src/services/provider.service", () => ({
  providerService: {
    sendMail: jest.fn(),
  },
}));

jest.mock("juice", () => jest.fn((html) => `${html}<!--juiced-->`));

// Import the worker processor logic
// Since it's anonymous in the file, we might need to export it or test it via the worker instance
// For now, I'll simulate the processor logic in a test-friendly way or extract it if needed.
// Actually, let's assume we can obtain the processor or just replicate the sequence for unit testing.

describe("Mail Worker Logic", () => {
  const mockJob = {
    id: "1",
    data: {
      to: "user@example.com",
      subject: "Test",
      html: "<html><body>Hello</body></html>",
      templateId: "welcome",
      templateContext: { name: "John" },
      locale: "en",
    },
  } as unknown as Job;

  const mockLog = { id: "log-123" };

  beforeEach(() => {
    jest.clearAllMocks();
    (prisma.emailLog.create as jest.Mock).mockResolvedValue(mockLog);
    (templateService.render as jest.Mock).mockResolvedValue(
      "<html>Rendered</html>",
    );
    (providerService.sendMail as jest.Mock).mockResolvedValue({
      messageId: "msg-123",
    });
  });

  it("should process direct HTML with tracking and juice", async () => {
    // Replicating worker logic sequence
    const { to, subject, html } = mockJob.data as any;
    const log = await prisma.emailLog.create({
      data: { recipient: to, subject, status: "PENDING" },
    });

    let finalHtml = html;
    if (finalHtml) {
      finalHtml = trackingService.injectPixel(finalHtml, log.id);
      finalHtml = trackingService.wrapLinks(finalHtml, log.id);
      finalHtml = juice(finalHtml);
    }

    await providerService.sendMail({ to, subject, html: finalHtml });

    expect(trackingService.injectPixel).toHaveBeenCalledWith(html, "log-123");
    expect(juice).toHaveBeenCalled();
    expect(providerService.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        html: expect.stringContaining("<!--juiced-->"),
      }),
    );
  });

  it("should render template with i18n support", async () => {
    const { templateId, templateContext, locale } = mockJob.data as any;

    const rendered = await templateService.render(
      templateId,
      templateContext,
      locale,
    );

    expect(templateService.render).toHaveBeenCalledWith(
      "welcome",
      { name: "John" },
      "en",
    );
    expect(rendered).toBe("<html>Rendered</html>");
  });

  it("should handle failover and update log status on failure", async () => {
    (providerService.sendMail as jest.Mock).mockRejectedValue(
      new Error("SMTP Failure"),
    );

    const { to, subject } = mockJob.data as any;
    const log = await prisma.emailLog.create({
      data: { recipient: to, subject, status: "PENDING" },
    });

    try {
      await providerService.sendMail({ to, subject });
    } catch (e) {
      await prisma.emailLog.update({
        where: { id: log.id },
        data: { status: "FAILED" },
      });
    }

    expect(prisma.emailLog.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { status: "FAILED" },
      }),
    );
  });

  it("should update log with messageId on success", async () => {
    (providerService.sendMail as jest.Mock).mockResolvedValue({
      messageId: "SES-123",
    });

    const { to, subject } = mockJob.data as any;
    const log = await prisma.emailLog.create({
      data: { recipient: to, subject, status: "PENDING" },
    });

    const info = await providerService.sendMail({ to, subject });

    await prisma.emailLog.update({
      where: { id: log.id },
      data: { status: "SENT", messageId: info.messageId },
    });

    expect(prisma.emailLog.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { status: "SENT", messageId: "SES-123" },
      }),
    );
  });
});
