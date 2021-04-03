module.exports = function(grunt) {
    var pkg = grunt.file.readJSON("package.json");
    var umdContent = [
    "(function (root, factory) {\n" +
    "    if (typeof define === 'function' && define.amd) {\n" +
    "        define([], factory);\n" +
    "    } else if (typeof module === 'object' && module.exports) {\n" +
    "        module.exports = factory();\n" +
    "    } else {\n" +
    "        root.CRSA = factory();\n" +
    "    }\n" +
    "})(this, function() {\n" +
    "'use strict';\n","\n" +
    "return CRSA;\n" +
    "});"
  ];
  var esmContent = [
    "","\n"+
    "export default CRSA;",
  ];
  grunt.initConfig({
    jshint: {
      files: ["./src/"+pkg.name+".js"],
    },
    concat: {
      umd: {
        options: {
          banner: umdContent[0],
          footer: umdContent[1],
        },
        dist: {
            src: ["./scr/"+pkg.name+".js"], 
            dest: "./umd/"+pkg.name+".js",
        },
      },
      esm: {
        options: {
          banner: esmContent[0],
          footer: esmContent[1],
        },
        dist: {
          src: ["./src/"+pkg.name+".js"],
          dest: "./esm/"+pkg.name+".js",
        },
      },
    },
    uglify: {
      options: {
        mangle: {},
        compress: {},
      },
      dist: {
        src: ["./umd/"+pkg.name+".js"],
        dest: "./umd/"+pkg.name+".min.js",
      },
    },
  });
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-contrib-concat");
  grunt.loadNpmTasks("grunt-contrib-uglify");  
  grunt.registerTask("default", ["jshint", "concat", "uglify"]);
};