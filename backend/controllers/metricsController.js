import Instance from "../models/Instance.js";
import { getSeries } from "../services/simulatorService.js";

export async function series(req, res) {
  const { instanceId } = req.query;

  let id = instanceId;
  if (!id) {
    const run = await Instance.findOne({ status: "Running" }).lean();
    if (!run) return res.json({ cpu:[], ram:[], gpu:[], disk:[], netIn:[], netOut:[] });
    id = String(run._id);
  }
  const data = getSeries(id, ["cpu","ram","gpu","disk","netIn","netOut"]);
  res.json(data);
}
