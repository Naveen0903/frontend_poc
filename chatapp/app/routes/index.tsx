import { ActionArgs, LoaderArgs, json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import Login from "components/login";
import RealtimeMessages from "components/realtime-messages";
import createServerSupabase from "utils/supabase.server";

export const action = async ({ request }: ActionArgs) => {
  const response = new Response();
  const supabase = createServerSupabase({ request, response });

  const { message } = Object.fromEntries(await request.formData());
  const { error } = await supabase.from("messages").insert({ content: String(message) });

  if(error) {
    console.log(error);
  }
  return json(null, { headers: response.headers });
}

export const loader = async ({ request }: LoaderArgs) => {
  const response = new Response();
  const supabase = createServerSupabase({ request, response })
  const { data } = await supabase.from("messages").select();
  return json({ messages: data ?? [] }, { headers: response.headers });
}


export default function Index() {
  const { messages } = useLoaderData();
  return (
    <>
      <Login />
      <RealtimeMessages serverMessages={messages} />
      <Form method="post">
        <input type="text" name="message" />
        <button type="submit">Submit</button>
      </Form>
    </>
  );
}
