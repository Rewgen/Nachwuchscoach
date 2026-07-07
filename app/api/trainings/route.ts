import { trainingsRepo } from "@/lib/server/db";
import { entityRoute } from "@/lib/server/routen";
import type { Training } from "@/lib/types";

export const dynamic = "force-dynamic";

const route = entityRoute<Training>(trainingsRepo);
export const POST = route.POST;
export const DELETE = route.DELETE;
