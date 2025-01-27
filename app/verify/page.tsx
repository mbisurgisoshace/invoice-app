import { AlertCircleIcon, ArrowLeftIcon, MailIcon } from "lucide-react";

import {
  Card,
  CardTitle,
  CardHeader,
  CardFooter,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function Verify() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <Card className="w-[380px] px-5">
        <CardHeader className="text-center">
          <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-blue-100 mb-4">
            <MailIcon className="size-12 text-blue-500" />
          </div>

          <CardTitle className="text-2xl font-bold">Check your Email</CardTitle>
          <CardDescription>
            We have sent a verification link to your email address.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mt-4 rounded-md bg-yellow-50 border-x-yellow-300 p-4">
            <div className="flex items-center">
              <AlertCircleIcon className="size-5 text-yellow-400" />
              <p className="text-sm font-medium text-yellow-700 ml-3">
                Be sure to check your spam folder!
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Link
            href={"/"}
            className={buttonVariants({
              className: "w-full",
              variant: "outline",
            })}
          >
            <ArrowLeftIcon className="size-4 mr-2" />
            Back to Homepage
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
