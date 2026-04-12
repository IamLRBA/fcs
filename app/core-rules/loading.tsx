/**
 * Core rules page loading — lightweight placeholder matching legal/content pages.
 */
export default function CoreRulesLoading() {
  return (
    <div className="min-h-screen bg-unified px-4 pt-28 pb-20">
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-20 w-20 mx-auto rounded-2xl bg-primary-200/60 dark:bg-neutral-700/60" />
        <div className="h-10 w-full max-w-lg mx-auto rounded-lg bg-primary-200/50 dark:bg-neutral-700/50" />
        <div className="h-24 w-full rounded-2xl bg-primary-100/70 dark:bg-neutral-800/70" />
        <div className="h-48 w-full rounded-2xl bg-primary-100/50 dark:bg-neutral-800/50" />
        <div className="h-48 w-full rounded-2xl bg-primary-100/50 dark:bg-neutral-800/50" />
      </div>
    </div>
  )
}
