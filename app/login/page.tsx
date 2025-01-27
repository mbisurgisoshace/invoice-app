import { redirect } from "next/navigation";

import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/SubmitButton";

import { auth, signIn } from "../utils/auth";

export default async function Login() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <>
      <div className="flex h-screen w-full items-center justify-center px-4">
        <Card className="max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>
              Enter your email below to login into your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              action={async (formData) => {
                "use server";
                await signIn("nodemailer", formData);
              }}
              className="flex flex-col gap-y-4"
            >
              <div className="flex flex-col gap-y-2">
                <Label>Email</Label>
                <Input
                  required
                  name="email"
                  type="email"
                  placeholder="hello@hello.com"
                />
              </div>
              <SubmitButton />
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
