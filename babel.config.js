// babel.config.js
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Remove expo-router/babel line since it's deprecated in SDK 50
  };
};
