import { leistungenRepo } from "@/lib/server/db";
import { entityRoute } from "@/lib/server/routen";
import type { Leistung } from "@/lib/types";

export const dynamic = "force-dynamic";

const route = entityRoute<Leistung>(leistungenRepo);
export const POST = route.POST;
export const DELETE = route.DELETE;
