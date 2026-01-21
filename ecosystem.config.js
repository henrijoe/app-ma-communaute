// ecosystem.config.js
module.exports = {
  apps : [{
	name: "ma-communaute",
    script: 'dist/app.js',
    watch: ".",
	ignore_watch : ["node_modules"],
	watch_options: {
      "followSymlinks": false
    }
	// watch_delay: 1000
  }]
};