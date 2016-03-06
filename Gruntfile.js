module.exports = function (grunt) {
    require('time-grunt')(grunt);
    require('load-grunt-tasks')(grunt);
	
    grunt.initConfig({
        karma: {
            unit: {
                configFile: 'karma.conf.js',
                // singleRun: true
            }
        }
    });
    
	grunt.registerTask('test', ['karma']);
};