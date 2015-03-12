module.exports = function(grunt) {
  grunt.initConfig({
    watch: {
      files: ['src/module1/static/js/*.js',
              'src/module1/static/js/*/*.js',
              'src/module1/static/js/*/*.html',
              'src/module1/static/*.html',
              'src/module1/static/partials/*.html',
              'src/module1/static/tmpl/*.html'],
      options: {
        livereload: true
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.registerTask('default', ['watch']);

};