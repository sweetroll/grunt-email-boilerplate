/*jshint node:true */
module.exports = function(grunt) {
	"use strict";

	var path = require('path'),
		_ = grunt.util._;

	/*
	Config
	----------------------------------------*/
	grunt.initConfig({

		pkg: grunt.file.readJSON('package.json'),


		/*
		Project Paths
		----------------------------------------*/
		paths: {
			//images folder name
			images: 'images',

			//where to store built files
			dist: 'dist<%= grunt.template.today("yyyymmdd") %>',

			//sources
			src: 'src',

			//main email file
			email: 'email.html',

			//enter here yout production domain
			distDomain: 'http://www.mydomain.com/',

			//this is the default development domain
			devDomain: 'http://localhost:8000/'
		},


		/*
		Clean Up
		----------------------------------------*/
		clean: {
			dist: ['<%= paths.dist %>']
		},


		/*
		Copy .gif files
		Used internally
		----------------------------------------*/
		copy: {
			gif: {
				files: [{
					expand: true,
					cwd: '<%= paths.src %>/<%=paths.images %>',
					src: ['**/*.gif'],
					dest: '<%= paths.dist %>/<%=paths.images %>'
				}]
			}
		},


		/*
		Scss Compiling
		----------------------------------------*/
		compass: {

			dev: {
				options: {
					
					//Set the parent folder of scss files
					basePath : '<%= paths.src %>',

					/*
					Accepts some compass command line option
					SEE: https://github.com/gruntjs/grunt-contrib-compass
					*/
					config: path.normalize(__dirname + '/vendor/compass-config.rb')
				}
			},

			dist: {
				options: {
					basePath : '<%= paths.dist %>',
					force: true,
					environment: 'production',
					config: path.normalize(__dirname + '/vendor/compass-config.rb'),
					sassDir: '../<%= paths.src %>/css/scss'
				}
			}
		},


		/*
		EJS Template Rendering
		----------------------------------------*/
		render: {
			options: {
				data: 'data/data.json',
			},
			dev: {
				src: '<%= paths.src %>/<%= paths.email %>',
				dest: '<%= paths.src %>/_tmp.<%= paths.email %>'
			},
			dist: {
				src: '<%= paths.src %>/<%= paths.email %>',
				dest: '<%= paths.dist %>/<%= paths.email %>'
			}
		},


		/*
		Environment related tasks
		----------------------------------------*/
		devcode: {

			options: {

				// Parse HTML files?
				html: true,

				// Parse JS files?
				js: false,

				// Parse CSS files?
				css: false,

				// Remove devcode comments even if code was not removed
				clean: true, 

				block: {
					open: 'devcode', // with this string we open a block of code
					close: 'endcode' // with this string we close a block of code
				},

				// Default destination which overwrittes environment variable
				dest: 'dev'
			},

			// Settings for task used with 'devcode:dev'
			dev: {
				options: {
					source: '<%= paths.src %>/',
					dest: '<%= paths.src %>/',
					env: 'development',
					filter: function (filepath) {
						return path.basename(filepath) !== grunt.template.process('<%= paths.email %>');
					}
				}
			},

			// Settings for task used with 'devcode:dist'
			dist: {
				options: {
					source: '<%= paths.dist %>/',
					dest: '<%= paths.dist %>/',
					env: 'production'
				}
			}
		},

		/*
		Environment related tasks
		----------------------------------------*/
		premailer: {

			dist_html: {
				options: {
					// SEE: https://github.com/dwightjack/grunt-premailer#options
					baseUrl: 		'<%= paths.distDomain %>',
					css: 			'<%= paths.dist %>/css/style.css',
					removeClasses: 	true,
				},
				files: {
					'<%= paths.dist %>/<%= paths.email %>': ['<%= paths.dist %>/<%= paths.email %>']
				}

			},
			dist_txt: {
				options: {
					baseUrl: 	'<%= paths.distDomain %>',
					mode: 		'txt'
				},
				files: {
					'<%= paths.dist %>/<% print(paths.email.replace(/\.html$/, ".txt")); %>': ['<%= paths.dist %>/<%= paths.email %>']
				}

			},

			dev_html: {
				options: {
					baseUrl: '<%= paths.devDomain %>'
				},
				files: {
					// overwrite source file
					'<%= paths.src %>/_tmp.<%= paths.email %>': ['<%= paths.src %>/_tmp.<%= paths.email %>']
				}
			},
			dev_txt: {
				options: {
					baseUrl: 	'<%= paths.devDomain %>',
					mode: 		'txt'
				},
				files: {
					// overwrite source file
					'<%= paths.src %>/_tmp.<% print(paths.email.replace(/\.html$/, ".txt")); %>': ['<%= paths.src %>/_tmp.<%= paths.email %>']
				}
			}
		},



		/*
		Image Optimisation
		----------------------------------------*/
		imagemin: {

			dist: {
				options: {
					optimizationLevel: 3
				},
				files: [{
					expand: true,
					cwd: '<%= paths.src %>/<%=paths.images %>',
					src: ['**/*'],
					dest: '<%= paths.dist %>/<%=paths.images %>'
				}]
			}
		},


		/*
		Nodemailer (Send test emails)
		----------------------------------------*/
		nodemailer: {

			options: {

				/**
				 * Defaults to sendmail
				 * Here follows a Gmail SMTP example transport
				 * @see https://github.com/andris9/Nodemailer
				 */
				transport: {
					type: 'SMTP',
					options: {
						service: 'Gmail',
						auth: {
							user: 'bcc@evolution7.com.au',
							pass: 'evo721334'
						}
					}
				},

				from: '<Email Dev> EDM Dev',

				// Define recipients for NodeMailer
				recipients: [
					{
						email: 	'bcc@evolution7.com.au',
						name: 	'EDM Dev'
					},
					/*
					{
						email: 	test@litmus.com,
						name: 	'Litmus Test'
					}
					*/
				]
			},

			dist: {
				src: ['<%= paths.dist %>/<%= paths.email %>', '<%= paths.dist %>/<% print(paths.email.replace(/\.html$/, ".txt")); %>']
			},

			dev: {
				src: ['<%= paths.src %>/_tmp.<%= paths.email %>', '<%= paths.src %>/_tmp.<% print(paths.email.replace(/\.html$/, ".txt")); %>']
			}

		},


		/*
		Watching
		----------------------------------------*/
		watch: {
			compass: {
				files: ['src/css/scss/**/*.scss'],
				tasks: ['compass:dev']
			},
			html: {
				files: ['src/email.html', 'src/_inc/**/*.html'],
				tasks: ['render:dev', 'devcode:dev']
			}
		},

		/*
		Server tasks (Internal)
		----------------------------------------*/
		connect: {

			options: {
				hostname: '*',
				port: 8000,
				open: '<%= paths.devDomain %>_tmp.<%= paths.email %>'
			},

			dev: {
				options: {
					base: '<%= paths.src %>'
				}
			},

			send: {
				options: {
					base: '<%= paths.src %>',
					keepalive: true
				}
			},

			dist: {
				options: {
					base: '<%= paths.dist %>',
					keepalive: true
				}
			}

		  }

	});


	/*
	Environment related tasks
	----------------------------------------*/
	[
		'grunt-contrib-connect',
		'grunt-contrib-watch',
		'grunt-contrib-copy',
		'grunt-contrib-imagemin',
		'grunt-contrib-clean',
		'grunt-contrib-compass',
		'grunt-nodemailer',
		'grunt-premailer',
		'grunt-ejs-render'
	].forEach(grunt.loadNpmTasks);

	grunt.loadTasks( path.normalize(__dirname + '/vendor/tasks') );


	/*
	Register Tasks
	----------------------------------------*/
	grunt.registerTask('default', 'dev');

	grunt.registerTask('dev', [
		'render:dev',
		'devcode:dev',
		'connect:dev',
		'watch'
	]);

	grunt.registerTask('dist', [
		'clean:dist',
		'copy',
		'imagemin:dist',
		'compass:dist',
		'render:dist',
		'devcode:dist',
		'premailer:dist_html',
		'premailer:dist_txt'
	]);

	grunt.registerTask('send', 'Simulates an email delivery. Either use "send:dev" or "send:dist"', function (env) {
		if (env === 'dev') {
			grunt.task.run([
				'compass:dev',
				'render:dev',
				'devcode:dev',
				'premailer:dev_html',
				'premailer:dev_txt',
				'nodemailer:dev',
				'connect:send'
			]);
		} else if (env === 'dist') {
			grunt.task.run(['dist', 'nodemailer:dist']);
		} else {
			grunt.fail.fatal('Test environment needed. Either use "send:dev" or "send:dist"');
		}
	});

};
