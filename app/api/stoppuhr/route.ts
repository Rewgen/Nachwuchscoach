import { stoppuhrRepo } from "@/lib/server/db";
import { entityRoute } from "@/lib/server/routen";
import type { StoppuhrSession } from "@/lib/types";

export const dynamic = "force-dynamic";

const route = entityRoute<StoppuhrSession>(stoppuhrRepo);
export const POST = route.POST;
export const DELETE = route.DELETE;
