"use client";

import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

const components: { title: string; href: string; description: string }[] = [
  {
    title: "Authentication",
    href: "/dashboard/authentication",
    description:
      "An authentication as a service, which enables to authentication, onboard and manage users of your application seamlessly",
  },
  {
    title: "Database",
    href: "/dashboard/database",
    description:
      "A Database as a service, which lets you create SQL tables required for your application",
  },
  {
    title: "Storage",
    href: "/dashboard/storage",
    description:
      "A storage as a service which lets you create buckets and manage all user objects",
  },
  {
    title: "Mailer",
    href: "/dashboard/mailer",
    description:
      "A mailer as a service which lets you send emails, manage templates and track email status",
  },
];

const DashboardNavbar = () => {
  const router = useRouter();

  const logOut = () => {
    localStorage.removeItem("flexibase-admin-user");
    router.replace("/");
  };

  return (
    <div className="flex border items-center justify-between p-3">
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Services</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                {components.map((component) => (
                  <ListItem
                    key={component.title}
                    title={component.title}
                    href={component.href}
                  >
                    {component.description}
                  </ListItem>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <Link
              target="_blank"
              href="https://github.com/ModularMinds/flexibase"
              legacyBehavior
              passHref
            >
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Documentation
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      <div className="flex gap-2">
        <Link href="/dashboard/profile">
          <Button variant="ghost">Profile</Button>
        </Link>
        <Button variant={"outline"} onClick={logOut}>
          Logout
        </Button>
      </div>
    </div>
  );
};

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className,
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});

ListItem.displayName = "ListItem";

export default DashboardNavbar;
