/*global describe it before after  =*/

require(["lib/architect/architect", "lib/chai/chai", "/vfs-root"], 
  function (architect, chai, baseProc) {
    var expect = chai.expect;
    
    architect.resolveConfig([
        {
            packagePath : "plugins/c9.core/c9",
            workspaceId : "johndoe/dev",
            startdate   : new Date(),
            debug       : true,
            smithIo     : "{\"prefix\":\"/smith.io/server\"}",
            hosted      : true,
            local       : false,
            davPrefix   : "/"
        },
        
        "plugins/c9.core/ext",
        "plugins/c9.core/events",
        "plugins/c9.core/http",
        "plugins/c9.core/util",
        "plugins/c9.ide.ui/lib_apf",
        "plugins/c9.core/settings",
        {
            packagePath  : "plugins/c9.ide.ui/ui",
            staticPrefix : "plugins/c9.ide.ui"
        },
        "plugins/c9.ide.editors/document",
        "plugins/c9.ide.editors/undomanager",
        "plugins/c9.ide.editors/editors",
        "plugins/c9.ide.editors/editor",
        "plugins/c9.ide.editors/tabs",
        {
            packagePath: "plugins/c9.ide.console/console",
            testing : 2
        },
        "plugins/c9.ide.editors/pane",
        "plugins/c9.ide.editors/page",
        "plugins/c9.ide.terminal/terminal",
        "plugins/c9.ide.run/output",
        {
            packagePath : "plugins/c9.ide.run/run",
            testing     : true,
            base        : baseProc,
            runners     : {
                "node" : {
                    "caption" : "Node.js (current)",
                    "cmd": ["node", "${debug?--debug-brk=15454}", "$file"],
                    "debugger": "v8",
                    "debugport": 15454,
                    "file_regex": "^[ ]*File \"(...*?)\", line ([0-9]*)",
                    "selector": "source.js",
                    "info": "Your code is running at \\033[01;34m$hostname\\033[00m.\n"
                        + "\\033[01;31mImportant:\\033[00m use \\033[01;32mprocess.env.PORT\\033[00m as the port and \\033[01;32mprocess.env.IP\\033[00m as the host in your scripts!\n"
                },
                "pythoni" : {
                    "caption" : "Python in interactive mode",
                    "cmd": ["python", "-i"],
                    "selector": "source.python",
                    "info": "Hit \\033[01;34mCtrl-D\\033[00m to exit.\n"
                }
            }
        },
        "plugins/c9.ide.preferences/preferences",
        "plugins/c9.ide.ui/forms",
        "plugins/c9.fs/fs",
        "plugins/c9.fs/proc",
        {
            packagePath: "plugins/c9.vfs.client/vfs_client",
            smithIo     : {
                "prefix": "/smith.io/server"
            }
        },
        "plugins/c9.ide.auth/auth",
        
        // Mock plugins
        {
            consumes : ["emitter", "apf", "ui"],
            provides : [
                "commands", "menus", "commands", "layout", "watcher", 
                "save", "fs", "anims", "clipboard"
            ],
            setup    : expect.html.mocked
        },
        {
            consumes : ["tabs", "proc", "output", "fs"],
            provides : [],
            setup    : main
        }
    ], function (err, config) {
        if (err) throw err;
        var app = architect.createApp(config);
        app.on("service", function(name, plugin){ plugin.name = name; });
    });
    
    function main(options, imports, register) {
        var tabs     = imports.tabs;
        var proc     = imports.proc;
        var fs       = imports.fs;
        
        expect.html.setConstructor(function(page){
            if (typeof page == "object")
                return page.pane.aml.getPage("editor::" + page.editorType).$ext;
        });
        
        describe('terminal', function() {
            before(function(done){
                apf.config.setProperty("allow-select", false);
                apf.config.setProperty("allow-blur", false);
                tabs.getTabs()[0].focus();
                
                bar.$ext.style.background = "rgba(220, 220, 220, 0.93)";
                bar.$ext.style.position = "fixed";
                bar.$ext.style.left = "20px";
                bar.$ext.style.right = "20px";
                bar.$ext.style.bottom = "20px";
                bar.$ext.style.height = "33%";
      
                document.body.style.marginBottom = "33%";
                done();
            });
            
            this.timeout(10000);
            
            it('should open an output window and run with a runner', function(done) {
                
                var c = "console.log('Hello World', new Date());";
                fs.writeFile("/helloworld.js", c, "utf8", function(err){
                    if (err) throw err.message;
                
                    tabs.open({
                        editorType : "output",
                        document   : {
                            title : "Output",
                            output : {
                                id : "output",
                                run : {
                                    runner  : "auto",
                                    options : {
                                        path : "/helloworld.js"
                                    }
                                }
                            }
                        }
                        
                    }, function(err, page){
                        setTimeout(function(){
                            expect.html(tabs.focussedPage.editor.ace.container).text(/Hello\s*World/);
                            done();
                        }, 2000)
                    });
                });
            });
            
            if (!onload.remain){
                after(function(done){
                    outline.unload();
                    
                    document.body.style.marginBottom = "";
                    done();
                });
            }
        });
        
        onload && onload();
    }
});