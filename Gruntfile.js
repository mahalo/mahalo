module.exports = function (grunt) {
    require('time-grunt')(grunt);
    require('load-grunt-tasks')(grunt);
    
	var src = [
			'access.ts',
			'bootstrap.ts',
			'app/**/*.ts',
			'expression/**/*.ts',
			'observer/**/*ts',
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
                    'test/utils/watch.test.js': 'test/utils/watch.test.ts'
                },
				options: {
					plugins: [
						'access-babel'
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