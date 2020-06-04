module.exports = function (api) {
  api.cache(true);

  const plugins = ['emotion'];
  const presets = ['next/babel'];

  return { plugins, presets };
};
