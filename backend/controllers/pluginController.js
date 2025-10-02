// controllers/plugin.controller.js
import Plugin from '../models/pluginModel.js';

export const getAllPlugins = async (req, res) => {
  try {
    const plugins = await Plugin.find().sort({ createdAt: -1 });
    res.status(200).json(plugins);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getPluginById = async (req, res) => {
  try {
    const plugin = await Plugin.findById(req.params.id);
    if (!plugin) {
      return res.status(404).json({ message: 'Plugin not found' });
    }
    res.status(200).json(plugin);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createPlugin = async (req, res) => {
  try {
    const { name, description, author, category, rating, downloads, status, version } = req.body;
    const newPlugin = new Plugin({
      name,
      description,
      author,
      category,
      rating,
      downloads,
      status,
      version,
    });
    await newPlugin.save();
    res.status(201).json(newPlugin);
  } catch (error) {
    res.status(400).json({ message: 'Invalid data', error: error.message });
  }
};

export const updatePlugin = async (req, res) => {
  try {
    const plugin = await Plugin.findById(req.params.id);
    if (!plugin) {
      return res.status(404).json({ message: 'Plugin not found' });
    }
    const { name, description, author, category, rating, downloads, status, version } = req.body;
    if (name) plugin.name = name;
    if (description) plugin.description = description;
    if (author) plugin.author = author;
    if (category) plugin.category = category;
    if (rating !== undefined) plugin.rating = rating;
    if (downloads) plugin.downloads = downloads;
    if (status) plugin.status = status;
    if (version) plugin.version = version;
    await plugin.save();
    res.status(200).json(plugin);
  } catch (error) {
    res.status(400).json({ message: 'Invalid data', error: error.message });
  }
};

export const deletePlugin = async (req, res) => {
  try {
    const plugin = await Plugin.findById(req.params.id);
    if (!plugin) {
      return res.status(404).json({ message: 'Plugin not found' });
    }
    await Plugin.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: 'Plugin deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};