"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Heart, Lock, MessageCircle, SendHorizonal } from "lucide-react";
import type { Session } from "@/lib/auth/session";
import { hasAccess, TIER_INFO } from "@/lib/tiers";
import { CHANNELS, SEED_POSTS, type CommunityPost } from "@/lib/data/community";
import { DataIcon } from "@/components/icon-map";
import { Avatar } from "@/components/ui/avatar";
import { TierBadge } from "@/components/ui/tier-badge";

/**
 * Community-Board (Gerüst).
 * Beiträge leben aktuell nur im Browser-State — später: Neon-Tabellen
 * (posts, replies, likes) + Realtime-Updates.
 */
export function CommunityBoard({ session }: { session: Session }) {
  const [activeChannel, setActiveChannel] = useState(CHANNELS[0].slug);
  const [posts, setPosts] = useState<CommunityPost[]>(SEED_POSTS);
  const [draft, setDraft] = useState("");
  const [liked, setLiked] = useState<Set<string>>(new Set());

  const channel = CHANNELS.find((c) => c.slug === activeChannel)!;
  const canWrite = hasAccess(session.tier, channel.writeTier);
  const channelPosts = useMemo(
    () => posts.filter((p) => p.channel === activeChannel),
    [posts, activeChannel]
  );

  function submitPost(e: React.FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (!body || !canWrite) return;
    setPosts((prev) => [
      {
        id: `local_${prev.length + 1}`,
        channel: activeChannel,
        author: session.name,
        authorTier: session.tier,
        avatarColor: session.avatarColor,
        timestamp: "gerade eben",
        body,
        likes: 0,
        replies: [],
      },
      ...prev,
    ]);
    setDraft("");
  }

  function toggleLike(postId: string) {
    setLiked((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">Community</h1>
        <p className="mt-2 text-zinc-400">
          Offene Fragen, Cases, Wins — hier baut ihr zusammen.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        {/* Channel-Liste */}
        <aside className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
          {CHANNELS.map((ch) => {
            const active = ch.slug === activeChannel;
            const writable = hasAccess(session.tier, ch.writeTier);
            return (
              <button
                key={ch.slug}
                onClick={() => setActiveChannel(ch.slug)}
                className={`flex shrink-0 items-center gap-3 rounded-2xl border px-4 py-3 text-left transition lg:w-full ${
                  active
                    ? "border-brand-500/40 bg-brand-500/10 text-white"
                    : "border-white/8 bg-surface-900/70 text-zinc-400 hover:border-white/15 hover:text-white"
                }`}
              >
                <span className={`grid size-8 shrink-0 place-items-center rounded-lg ${active ? "bg-brand-500/20 text-brand-300" : "bg-white/5 text-zinc-500"}`}>
                  <DataIcon name={ch.icon} className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5 text-sm font-medium">
                    {ch.name}
                    {!writable && <Lock className="size-3 text-zinc-600" />}
                  </span>
                  <span className="hidden truncate text-xs text-zinc-500 lg:block">
                    {ch.description}
                  </span>
                </span>
              </button>
            );
          })}
        </aside>

        {/* Feed */}
        <section className="min-w-0 space-y-4">
          {/* Composer */}
          {canWrite ? (
            <form
              onSubmit={submitPost}
              className="flex items-start gap-3 rounded-3xl border border-white/8 bg-surface-900/70 p-4"
            >
              <Avatar name={session.name} gradient={session.avatarColor} size="sm" />
              <div className="flex min-w-0 flex-1 flex-col gap-3">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={2}
                  placeholder={`Schreib etwas in „${channel.name}“…`}
                  className="w-full resize-none rounded-xl border border-white/10 bg-surface-950/60 px-4 py-3 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/20"
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-zinc-600">
                    Beiträge sind im Gerüst noch nicht dauerhaft gespeichert.
                  </p>
                  <button
                    type="submit"
                    disabled={!draft.trim()}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-accent-500 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
                  >
                    Posten <SendHorizonal className="size-3.5" />
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-gold-400/25 bg-gold-500/5 p-5">
              <p className="flex items-center gap-2.5 text-sm text-zinc-300">
                <Lock className="size-4 text-gold-400" />
                Schreiben in „{channel.name}“ ist ab Stufe{" "}
                <TierBadge tier={channel.writeTier} /> möglich — lesen kannst du alles.
              </p>
              <Link
                href="/einstellungen"
                className="text-sm font-semibold text-gold-400 transition hover:text-gold-500"
              >
                Upgrade ansehen →
              </Link>
            </div>
          )}

          {/* Posts */}
          {channelPosts.length === 0 && (
            <div className="rounded-3xl border border-dashed border-white/10 p-10 text-center text-sm text-zinc-500">
              Noch keine Beiträge in „{channel.name}“ — mach den Anfang!
            </div>
          )}
          {channelPosts.map((post) => {
            const isLiked = liked.has(post.id);
            return (
              <article
                key={post.id}
                className="rounded-3xl border border-white/8 bg-surface-900/70 p-5"
              >
                <div className="mb-3 flex items-center gap-3">
                  <Avatar name={post.author} gradient={post.avatarColor} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-white">
                      {post.author}
                      <TierBadge tier={post.authorTier} />
                    </p>
                    <p className="text-xs text-zinc-500">{post.timestamp}</p>
                  </div>
                </div>
                {post.title && (
                  <h3 className="mb-1.5 font-semibold text-white">{post.title}</h3>
                )}
                <p className="text-sm leading-relaxed text-zinc-300">{post.body}</p>

                <div className="mt-4 flex items-center gap-5 text-sm text-zinc-500">
                  <button
                    onClick={() => toggleLike(post.id)}
                    className={`flex items-center gap-1.5 transition ${isLiked ? "text-accent-400" : "hover:text-white"}`}
                  >
                    <Heart className={`size-4 ${isLiked ? "fill-accent-400" : ""}`} />
                    {post.likes + (isLiked ? 1 : 0)}
                  </button>
                  <span className="flex items-center gap-1.5">
                    <MessageCircle className="size-4" />
                    {post.replies.length}
                  </span>
                </div>

                {post.replies.length > 0 && (
                  <div className="mt-4 space-y-3 border-l-2 border-white/8 pl-4">
                    {post.replies.map((reply) => (
                      <div key={reply.id} className="flex items-start gap-2.5">
                        <Avatar name={reply.author} gradient={reply.avatarColor} size="sm" />
                        <div className="min-w-0 rounded-2xl bg-white/[0.04] px-4 py-2.5">
                          <p className="text-xs font-semibold text-zinc-300">
                            {reply.author}{" "}
                            <span className="ml-1 font-normal text-zinc-600">{reply.timestamp}</span>
                          </p>
                          <p className="mt-0.5 text-sm text-zinc-300">{reply.body}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            );
          })}

          {channel.writeTier === "pro" && canWrite && (
            <p className="text-center text-xs text-zinc-600">
              {TIER_INFO.pro.label}-Bereich — exklusiv für Pro-Mitglieder.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
