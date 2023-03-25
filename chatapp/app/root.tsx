import { LoaderArgs, MetaFunction, json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRevalidator,
} from "@remix-run/react";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/auth-helpers-remix";
import createServerSupabase from "utils/supabase.server";

import type { Database } from "db_types";
import type { SupabaseClient } from "@supabase/supabase-js";

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "New Remix App",
  viewport: "width=device-width,initial-scale=1",
});

export const loader = async ({ request }: LoaderArgs) => {
  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!
  }

  const response = new Response();
  const supabase = createServerSupabase({ request, response })

  const {
    data: { session }
  } = await supabase.auth.getSession();

  return json({ env, session }, { headers: response.headers });
}

type TypedSupabaseClient = SupabaseClient<Database>
export type SupabaseOutletContext = {
  supabase: TypedSupabaseClient
};

export default function App() {
  const { env, session } = useLoaderData();
  const revalidator = useRevalidator();

  const [supabase] = useState(() => createBrowserClient(
    env.SUPABASE_URL,
    env.SUPABASE_ANON_KEY
  ));

  const serverAccessToken = session?.access_token;
  useEffect(() => {
    const { data: { subscription }} = supabase.auth.onAuthStateChange((event, session) => {
      if(session?.access_token !== serverAccessToken) {
        revalidator.revalidate();
      }
    });
    return () => {
      subscription.unsubscribe();
    }
  }, []);

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet context={{ supabase }} />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
