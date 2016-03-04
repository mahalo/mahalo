module.exports = function (grunt) {
    require('time-grunt')(grunt);
    require('load-grunt-tasks')(grunt);
    
	var src = [
			'access.ts',
			'bootstrap.ts',
			'app/**/*.ts',
			'expression/**/*.ts',
			'observer/**/*.ts',
			'change-detection/**/*.ts',
			'utils/**/*.ts',
			'watcher/**/*.ts'
		];
	
    grunt.initConfig({
        babel: {
            dist: {
                files: [
                    {
                        expand: true,
                        src: src,
						ext: '.js'
                    }
                ]
            },
            test: {
                files: {
                    
                },
				options: {
					plugins: [
						'access-babel',
						'transform-flow-strip-types',
						'transform-runtime'
					]
				}
            }
        },
        karma: {
            unit: {
                configFile: 'karma.conf.js',
                // singleRun: true
            }
        },
		watch: {
			options: {
				reload: true
			},
			src: {
				files: src,
				tasks: ['newer:babel:dist']
			}
		}
    });
    
    grunt.registerTask('default', ['babel:dist', 'watch:src']);
	grunt.registerTask('test', ['babel:test', 'karma']);
};