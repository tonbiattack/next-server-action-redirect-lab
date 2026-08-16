import { redirect } from "next/navigation";

try {
  redirect("/posts/observed");
} catch (error) {
  const redirectError = error as Error & { digest?: unknown };
  console.log(
    JSON.stringify(
      {
        name: redirectError.name,
        message: redirectError.message,
        digest: redirectError.digest,
      },
      null,
      2,
    ),
  );
}
