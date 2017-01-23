module.exports = function (grunt) {
    grunt.initConfig({
        ts: {
            dev: {
                src: ['src/**/*.ts'],
                dest: 'dist',
                options: {
                    module: 'commonjs',
                    moduleResolution: 'node',
                    target: 'es5',
                    sourceMap: false,
                    declaration: false
                }
            }
        },

        copy: {
            dev: {
                files: [
                    {
                        expand: true,
                        cwd: 'src/client/public',
                        src: [
                            './**'
                        ],
                        dest: 'dist'
                    },
                    {
                        src: 'bower_components/socket.io-client/dist/socket.io.min.js',
                        dest: 'dist/vendor/socket.io/socket.io.js'
                    },
                    {
                        src: 'bower_components/phaser/build/phaser.min.js',
                        dest: 'dist/vendor/phaser/phaser.js'
                    }
                ]
            }
        },

        browserify: {
            dev: {
                src: ['dist/client/main.js'],
                dest: 'dist/client.js',
                options: {
                    paths: [
                        'dist/core',
                        'dist/client',
                    ]
                }
            }
        },

        clean: {
            dev: ['dist/**/*']
        },

        watch: {
            scripts: {
                files: ['src/**/*'],
                tasks: ['dev'],
                options: {
                    spawn: false,
                    debounceDelay: 250
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-ts');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-browserify');

    grunt.registerTask('dev', [
        'clean:dev',
        'ts:dev',
        'copy:dev',
        'browserify:dev'
    ]);
};