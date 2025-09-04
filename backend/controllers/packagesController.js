import Package from "../models/Package.js";
import mongoose from "mongoose";

export async function listPackages(req, res) {
  try {
    const q = {};
    if (req.query.status) q.status = req.query.status;
    const items = await Package.find(q).sort({ createdAt: -1 }).lean();
    res.json({ items });
  } catch {
    res.status(500).json({ error: "Failed to list packages" });
  }
}

export async function createPackage(req, res) {
  try {
    const {
      name,
      price,
      currency = "usd",
      type = "one-time",
      status = "active",
      features = [],
    } = req.body || {};
    if (!name || typeof price !== "number")
      return res
        .status(400)
        .json({ error: "name and numeric price (cents) are required" });
    const item = await Package.create({
      name,
      price,
      currency,
      type,
      status,
      features,
    });
    res.status(201).json({ item });
  } catch {
    res.status(500).json({ error: "Failed to create package" });
  }
}

export async function updatePackage(req, res) {
  try {
    const item = await Package.findByIdAndUpdate(
      req.params.id,
      req.body || {},
      { new: true }
    ).lean();
    if (!item) return res.status(404).json({ error: "Package not found" });
    res.json({ item });
  } catch {
    res.status(500).json({ error: "Failed to update package" });
  }
}

export async function deletePackage(req, res) {
  try {
    const item = await Package.findByIdAndUpdate(
      req.params.id,
      { status: "inactive" },
      { new: true }
    ).lean();
    if (!item) return res.status(404).json({ error: "Package not found" });
    res.json({ item, softDeleted: true });
  } catch {
    res.status(500).json({ error: "Failed to delete package" });
  }
}
export async function getPackageByIdController(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid package id" });
    }

    const item = await Package.findById(id).lean();
    if (!item) return res.status(404).json({ error: "Package not found" });

    // Optional: if you only want to expose active packages to non-admins, you could gate here.
    // if (item.status !== "active") return res.status(403).json({ error: "Package not active" });

    res.json({ item });
  } catch {
    res.status(500).json({ error: "Failed to fetch package" });
  }
}
