import { getSession } from "@/lib/auth/session";
import { CommunityBoard } from "@/components/app/community-board";

export const metadata = { title: "Community" };

export default async function CommunityPage() {
  const session = (await getSession())!;
  return <CommunityBoard session={session} />;
}
