import { uebungenRepo } from "@/lib/server/db";
import { entityRoute } from "@/lib/server/routen";
import type { Uebung } from "@/lib/types";

export const dynamic = "force-dynamic";

const route = entityRoute<Uebung>(uebungenRepo);
export const POST = route.POST;
export const DELETE = route.DELETE;
