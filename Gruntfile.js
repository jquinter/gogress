module.exports = function(grunt) {
  grunt.initConfig({
    jade: {
      compile: {
        options: {
          pretty: true,
          data: {
            debug: false
          }
        },
        files: [{
          expand: true,
          cwd: 'src/module1/static/js/',
          src: ['**/*.jade'],
          dest: 'src/module1/static/js/',
          ext: '.html'
        }, {
          expand: true,
          cwd: 'src/module1/',
          src: ['*.jade'],
          dest: 'src/module1/',
          ext: '.html'
        }, {
          expand: true,
          cwd: 'src/module1/static/',
          src: ['**/*.jade'],
          dest: 'src/module1/static',
          ext: '.html'
        }]
      }
    },
    watch: {
      jade: {
        files: ['src/module1/static/**/*.jade'],
        tasks: ['jade']
      },
      files: ['src/module1/static/js/*.js',
        'src/module1/static/js/*/*.js',
        'src/module1/static/js/*/*.html',
        'src/module1/static/js/*.html',
        'src/module1/static/*.html',
        'src/module1/static/partials/*.html',
        'src/module1/static/tmpl/*.html'
      ],
      options: {
        livereload: true
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jade');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-newer');
  grunt.registerTask('default', ['watch']);
  grunt.registerTask('dev', ['newer:jade']);

};