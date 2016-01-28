module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                separator: '\n'
            },
            basic: {
                src: ['bower_components/jquery/dist/jquery.min.js',
                    'bower_components/handlebars/handlebars.js',
                    'bower_components/nextprot/dist/nextprot.js',
                    'js/compiled-templates.js',
                    'js/proteotypicity.js'],
                dest: 'app.js'
            },
            css: {
                src: ['bower_components/bootstrap/dist/css/bootstrap.css','css/style.css'],
                dest:'app.css'
            }
        },
        uglify: {
            options: {sourceMap: true},
            basic: {
                src: 'app.js',
                dest: 'app.min.js'
            }
        },
        bump: {
            options: {
                files: ['package.json'],
                updateConfigs: [],
                commit: true,
                commitMessage: 'Release v%VERSION%',
                commitFiles: ['package.json'],
                createTag: true,
                tagName: 'v%VERSION%',
                tagMessage: 'Version %VERSION%',
                push: true,
                pushTo: "https://github.com/MatSchaeff/proteotypicity-checker.git",
                gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d',
                globalReplace: false,
                prereleaseName: false,
                regExp: false
            }
        },
        connect: {
            server: {
                options: {
                    port: 9000,
                    livereload: true,
                    base: '.'
                }
            }
        },
        watch: {
            all: {
                options: {
                    livereload: true
                },
                files: ['js/*.js'],
                tasks: 'concat'
            },
            handlebars: {
                files: ['templates/*.tmpl'],
                tasks: ['handlebars:compile']
            }
        },
        handlebars: {
            compile: {
                src: 'templates/*.tmpl',
                dest: 'js/compiled-templates.js',
                options: {
                    namespace: "HBtemplates"
                }
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-bump');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-handlebars');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jshint');


    // Default task(s).
    grunt.registerTask('default', ['concat']);

    // Call this task for production
    grunt.registerTask('prod', ['concat', 'uglify']);
    grunt.registerTask('test', ['connect:server', 'qunit']);
    grunt.registerTask('hbs', ['handlebars:compile']);
    grunt.registerTask('serve', ['connect:server', 'watch']);
};