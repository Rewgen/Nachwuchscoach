import { platzplaeneRepo } from "@/lib/server/db";
import { entityRoute } from "@/lib/server/routen";
import type { Platzplan } from "@/lib/types";

export const dynamic = "force-dynamic";

const route = entityRoute<Platzplan>(platzplaeneRepo);
export const POST = route.POST;
export const DELETE = route.DELETE;
