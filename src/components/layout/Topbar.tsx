import { SearchIcon, BellIcon } from "@/components/icons";
import { createClient } from "@/lib/supabase/server";
import { ProfileMenu } from "./ProfileMenu";

export async function Topbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const email = user?.email ?? "";
  const name =
    (user?.user_metadata?.name as string | undefined) ||
    (email ? email.split("@")[0] : "Agent");

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-border bg-surface px-6">
      <div className="relative flex-1 max-w-xl">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-light">
          <SearchIcon size={18} />
        </span>
        <input
          type="text"
          placeholder="Rechercher"
          className="h-10 w-full rounded-lg border border-transparent bg-background pl-10 pr-4 text-sm text-foreground placeholder:text-muted-light focus:border-primary focus:bg-surface focus:outline-none"
        />
      </div>

      <div className="ml-auto flex items-center gap-4">
        <button
          className="relative rounded-full p-2 text-muted hover:bg-background hover:text-foreground"
          aria-label="Notifications"
        >
          <BellIcon size={20} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-status-progress ring-2 ring-surface" />
        </button>

        <ProfileMenu name={name} email={email} />
      </div>
    </header>
  );
}
