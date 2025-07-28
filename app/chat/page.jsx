import { Suspense } from "react";
import Chat from "./Chat";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Chat />
    </Suspense>
  );
}
