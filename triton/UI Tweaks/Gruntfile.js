module.exports = function (grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    banner: grunt.file.read('src/header.js'),
    clean: ['build'],
    uglify: {
      options: {
        beautify: true,
        mangle: false,
        compress: false,
        preserveComments: 'some',
        banner: '<%= banner %>'
      },
      js: {
        src: 'build/<%= pkg.name %>.user.js',
        dest: 'build/<%= pkg.name %>-ugly.user.js'
      }
    },
    concat: {
      js: {
        src: [
          'src/header.js',
          'lib/*.js',
          // 'node_modules/d3/d3.js',
          'node_modules/lodash/index.js',
          '../common/utils.js',
          '../common/framework.js',
          'src/constants.js',
          'src/mod_*.js',
          'src/main.js'
        ],
        dest: 'build/<%= pkg.name %>.user.js'
      },
      css: {
        src: 'src/*.css',
        dest: 'build/<%= pkg.name %>.css'
      }
    },
    jshint: {
      all: [
        'Gruntfile.js',
        'src/*.js',
        // 'build/<%= pkg.name %>.user.js',
        '../common/*.js'
      ]
    },
    watch: {
      css: {
        files: ['src/*.css'],
        tasks: ['clean', 'concat:css']//, 'cssmin:css']
      },
      js: {
        files: ['Gruntfile.js', 'src/*.js', '../common/*.js'],
        tasks: ['clean', 'concat:js', 'jshint', 'uglify:js']
      }
    }
  });


  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');


  // Default task(s).
  grunt.registerTask('default', [
    'clean',
    'concat:js',
    'jshint',
    'uglify:js'
  ]);

};
