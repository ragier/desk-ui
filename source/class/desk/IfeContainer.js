
/**
 * @ignore (ImageData)<
 * @ignore (THREE*)
 * @ignore (chroma*)
 * @ignore (require*)
 * @ignore (performance*)
  * @ignore (_*)
 */


qx.Class.define("desk.IfeContainer", {
    extend: qx.ui.container.Composite,

    /**
     * constructor
     */
    construct: function(sideViewer) {
	    this.base(arguments);

	    //hack to include
	    new desk.ProgressBar();

	    this.__sideViewer = sideViewer;
	    
	    //if (sideViewer) {
	    ///  this.__backgroundColor = "rgb(248, 252, 247)";
	    //} else {
	    //  this.__backgroundColor = "rgb(252, 247, 248)";
	    //}


	    this.__backgroundColor = "rgb(249, 250, 248)";
	      
	      
	    var layout = new qx.ui.layout.HBox();
        layout.setSpacing(1);

        this.setLayout(layout);

        this.createUI();
        this.removeAll();
    },

    destruct: function() {

    },

    events: {

    },

    properties: {
		  mainViewer : { init : null}
    },

    members: {
        __MPR: null,
        __meshViewer: null,
        __backgroundColor : "white",

        __volumeAnat: null,
        __mesh3DModel : null,

        __buttonOpenAnat: null,
        __buttonOpenFunc: null,
        __buttonCloseAll : null,

        __menu : null,
        __burger:null,
        __subMenuAnat: null,
        __subMenuFunc: null,
        __subMenuButtons : null,

        __collapseButton : null,

        __IRMAnatName : null,
        __anatButtonMeta : null,

        __contrastSlider : null,
        __brightnessSlider : null,

        __colors : null,
        __widthMenu : 220,

        __sideViewer : null,

        /**
         * create UI
         */
        createUI: function() {
            var that = this;
            var MPR = this.createMPR();

            var menu = this.__menu = this.createMenu();
            this.add(menu, { flex:0 });

            //this.__collapseButton = this.createCollapseButton();
            //this.add(this.__collapseButton, { flex: 0 });

            this.add(MPR, { flex: 6 });

            this.__buttonOpenFunc.addListener("execute", function () {
                var target = _.find(that.__subMenuFunc, function (o) { return !o.volumeFunc;});
                
                if (target === undefined) {
                    var index = require('electron').remote.dialog.showMessageBox({
                      type : "warning",
                      title : "Echec de l'ouverture d'un nouveau calque",
                      message : "3 calques sont déjà ouverts, supprimer un calque afin de pouvoir en ouvrir un autre.",
                      buttons : ['Ok']
                    });
                } else {
                  target.addFuncFile(function () {
                      //Before
                    window.setTimeout(function() {
                        that.__buttonOpenAnat.setEnabled(false);
                        that.__buttonOpenFunc.setEnabled(false);
                    }, 1);

                  }, function() {
                        //Show and move to the end
                      var parent = target.$$parent;
                      parent.remove(target);
                      parent.add(target, {flex:1});
                      target.show();
                  
                      //After
                      that.__buttonOpenFunc.setEnabled(true);
                      that.__buttonOpenAnat.setEnabled(true);
                      that.__buttonCloseAll.setEnabled(true);
                  });
                }
                
                /*

                if (!that.__subMenuFunc[0].volumeFunc && !that.__subMenuFunc[1].volumeFunc) {
                    //Aucun calque ouvert
                    target = that.__subMenuFunc[0];
                }
                var dialog = require('electron').remote.dialog;

                if (that.__subMenuFunc[0].volumeFunc && !that.__subMenuFunc[1].volumeFunc) {
                    //Calque ouvert sur le 1er slot
                    var index = dialog.showMessageBox({
                      type : "question",
                      title : "Ouverture d'un calque fonctionnel",
                      message : "Ajouter un second calque ou remplacer l'actuel?",
                      buttons : ['Ajouter', 'Remplacer','Annuler'],
                      defaultId : 2
                    });

                    if (index == 2) return;

                    if (index == 1) target = that.__subMenuFunc[0];
                      else target = that.__subMenuFunc[1];
                }

                if (!that.__subMenuFunc[0].volumeFunc && that.__subMenuFunc[1].volumeFunc) {
                    //Calque ouvert sur le 1er slot
                    var index = dialog.showMessageBox({
                      type : "question",
                      title : "Ouverture d'un calque fonctionnel",
                      message : "Ajouter un second calque ou remplacer l'actuel?",
                      buttons : ['Ajouter', 'Remplacer','Annuler'],
                      defaultId : 2
                    });

                    if (index == 2) return;

                    if (index == 1) target = that.__subMenuFunc[1];
                      else target = that.__subMenuFunc[0];
                }

                if (that.__subMenuFunc[0].volumeFunc && that.__subMenuFunc[1].volumeFunc) {
                  //Calque ouvert sur le 1er slot
                  var index = dialog.showMessageBox({
                    type : "question",
                    title : "Ouverture d'un calque fonctionnel",
                    message : "Remplacer quel calque fonctionnel?",
                    buttons : ['Remplacer le 1er', 'Remplacer le 2ème','Annuler'],
                    defaultId : 2
                  });

                  if (index == 2) return;

                  if (index == 1) target = that.__subMenuFunc[1];
                    else target = that.__subMenuFunc[0];
                }

  */
            });
        },

        createMenu: function() {

            var that = this;
            //Menu container
            var layout = new qx.ui.layout.VBox();
            layout.setSpacing(10);
            var container = new qx.ui.container.Composite(layout);
            
            
            container.set({
                width: this.__widthMenu+50,
                backgroundColor: this.__backgroundColor
            })
            container.setPadding(5);
            //container.setPaddingRight(0);

            //container.add(new qx.ui.core.Widget().set({height:1, backgroundColor:"gray"}));
            
            var burger = this.__burger = new qx.ui.basic.Image("resource/ife/menu_left.png");
            burger.setAlignX("right");
            burger.setCursor("pointer");
            var tooltip = new qx.ui.tooltip.ToolTip("Réduire le menu");
            burger.setToolTip(tooltip);
            
            container.add(burger);
            var menuVisible = true;
            var phantom = new qx.ui.core.Widget();
            
            phantom.setHeight(32);
            
            //that.__sideViewer.isVisible()
            
            burger.addListener("click", function () {
                if (menuVisible) 
                { //Hide menu
                  menuVisible = false;
                  burger.getToolTip().setLabel("Afficher le menu");
                  
                  if (that.__sideViewer.isVisible())
                  { //compare mode
                    burger.setSource("resource/ife/menu_top.png");
                    that.__menu.exclude();
                    that.__sideViewer.getChildren()[1].exclude();
                    that.add(burger);
                    that.__sideViewer.add(phantom);
                  }
                  else 
                  { //single mode
                    burger.setSource("resource/ife/menu_right.png");  
                    that.__menu.exclude();
                    that.addAt(burger, 0); 
                  }
                }
                else 
                { // Show menu
                  menuVisible = true;
                  burger.getToolTip().setLabel("Réduire le menu");
                  if (that.__sideViewer.isVisible())
                  { //compare mode
                    burger.setSource("resource/ife/menu_bottom.png");
                    that.getChildren()[1].show();
                    that.remove(burger);
                    that.getChildren()[1].add(burger);
                    that.__sideViewer.getChildren()[1].show();
                    that.__sideViewer.remove(phantom);
                  }
                  else
                  { //single mode
                    burger.setSource("resource/ife/menu_left.png");
                    that.__menu.show();
                    that.remove(burger);
                    that.__menu.addAt(burger, 0);
                  }
                }
                
                
                
            });
            
            
            
            
            
            
            
            /*
            
            
            burger.addListener("click", function () {
                if (menuVisible) {
                    burger.getToolTip().setLabel("Afficher le menu");
                    if (!that.__sideViewer) {
                      that.getChildren()[1].exclude();
                      that.add(burger);
                      that.getMainViewer().getChildren()[1].exclude();
                      burger.setSource("resource/ife/menu_top.png");                      
                      that.getMainViewer().add(phantom);
                      
                    } else {
                      burger.setSource("resource/ife/menu_right.png");                      
                      that.__menu.exclude();
                      that.addAt(burger, 0);
                    }
                    burger.setPadding(5);
                    menuVisible = false;
                } else {
                    menuVisible = true;
                    burger.getToolTip().setLabel("Réduire le menu");
                    if (!that.__sideViewer) {
                      burger.setSource("resource/ife/menu_bottom.png");
                      that.getChildren()[1].show();
                      that.remove(burger);
                      that.getChildren()[1].add(burger);
                      that.getMainViewer().getChildren()[1].show();
                      that.getMainViewer().remove(phantom);
                    } else {
                      burger.setSource("resource/ife/menu_left.png");
                      that.__menu.show();
                      that.remove(burger);
                      that.__menu.addAt(burger, 0);
                    }
                    burger.setPadding(0);
                }
            });
            
            */
            
            container.add(new qx.ui.core.Spacer(), {flex: 1});

            this.__subMenuButtons = this.createSubMenuButtons();
            container.add(this.__subMenuButtons);

            container.add(new qx.ui.core.Spacer(), {flex: 1});
              
            var scroll = new qx.ui.container.Scroll();
            var target = new qx.ui.container.Composite(new qx.ui.layout.VBox().set({spacing:20}));
            scroll.add(target);
            
            this.__subMenuAnat = this.createSubMenuAnat();
            target.add(this.__subMenuAnat);
            
            
            this.__subMenuFunc = [];
            this.__subMenuFunc[0] = new desk.FuncLayer(this.__MPR, this.__meshViewer);
            target.add(this.__subMenuFunc[0], {flex: 1});
            this.__subMenuFunc[1] = new desk.FuncLayer(this.__MPR, this.__meshViewer);
            target.add(this.__subMenuFunc[1], {flex: 1});
            this.__subMenuFunc[2] = new desk.FuncLayer(this.__MPR, this.__meshViewer);
            target.add(this.__subMenuFunc[2], {flex: 1});
            
            container.add(scroll);
            
            container.add(new qx.ui.core.Spacer(), {flex: 1});

            if (that.__sideViewer) {
                container.add(this.createAbout());
            }

            return container;
        },


        alert : function (message, title, option) {
            // create the window instance
            var root = qx.core.Init.getApplication().getRoot();

            if (title === undefined) title = this.tr("Erreur : type de fichier");

            var win = new qx.ui.window.Window( title );
            win.setLayout(new qx.ui.layout.VBox(10));

            win.set({
                width : option.width || 400,
                alwaysOnTop : true,
                showMinimize : false,
                showMaximize : false,
                centerOnAppear : true,
                modal : true,
                movable : false,
                resizable : false,
                allowMaximize : false,
                allowMinimize : false
            });

            var label = new qx.ui.basic.Label(message);

            label.set({rich: true, wrap : true});

            // label to show the e.g. the alert message
            
            var scroll = new qx.ui.container.Scroll().set({maxHeight:600});
            
            win.add(scroll);
             
            scroll.add(label);

            // "ok" button to close the window
            var alertBtn = new qx.ui.form.Button("OK");

            root.add(win);

            alertBtn.addListener("execute", win.close.bind(win));

            win.add(alertBtn);

            alertBtn.setMarginLeft(100);
            alertBtn.setMarginRight(100);

            win.open();

        },


        createAbout : function () {
            var button = new qx.ui.form.Button(this.tr("A propos de ")+" EduAnat2 v2.0", "resource/ife/about.png").set({decorator: null});

            var win = new qx.ui.window.Window(this.tr("A propos de ")+" EduAnat2 v2.0");
            win.set({
                width : 750,
                height : 600,
                alwaysOnTop : true,
                showMinimize : false,
                showMaximize : false,
                centerOnAppear : true,
                //modal : true,
                movable : false,
                allowMaximize : false,
                allowMinimize : false,
                allowClose : true,
                resizable : false
            });

            win.setLayout(new qx.ui.layout.VBox(10));

            var scroll = new qx.ui.container.Scroll().set({maxHeight:500});
            var scrollContainer = new qx.ui.container.Composite(new qx.ui.layout.VBox().set({spacing:20}));
            scroll.add(scrollContainer);
            win.add(scroll);
              
            scrollContainer.add( new qx.ui.basic.Label([
                "<h3>EduAnat2</h3><em>Version 2.0 novembre 2018</em><br>",
                "EduAnat2 est un visualiseur 3D conçu pour enseigner les neurosciences et l’anatomie. EduAnat2 utilise la banque d’images AnaPeda spécialement développée pour des usages pédagogiques.",
                "",
                "<u>Avertissement :</u> ",
                "EduAnat2 est uniquement destiné à un usage pédagogique. Il n’est pas destiné à un usage médical ou auto médical. Nous déclinons toute responsabilité en cas d'utilisation incorrecte du logiciel.",
                "",
                "<u>Contributeurs :</u> ",
                "Rémi Agier",
                "Sandrine Beaudin",
                "Julien Cartier",
                "Philippe Cosentino",
                "Philippe Daubias",
                "Françoise Morel-Deville",
                "Emmanuel Seiglan",
                "Catherine Simand",
                "Sébastien Valette",
                "",
                "<u>Soutiens :</u>",
                "EduAnat2 a reçu le soutien financier  des LabEx Cortex et LabEx Primes de l’Université de Lyon, de l’Institut français de l’éducation et de l’Ecole normale supérieure de Lyon.",
                "",
                "<u>Information de licence :</u>",
                "Eduanat2 est basé sur l'infrastructure DESK (<a href=\"https://www.creatis.insa-lyon.fr/~valette/desk.html\">https://www.creatis.insa-lyon.fr/~valette/desk.html</a>) dont le code source est distribué sous licence CeCILL-B (BSD-compatible).",
                "",
                "<a>Informations pédagogiques :</a>",
                "<a href=\"http://acces.ens-lyon.fr/acces/thematiques/neurosciences/outils-numeriques\">http://acces.ens-lyon.fr/acces/thematiques/neurosciences/outils-numeriques",
                "",
              ].join('<br>') ).set({
                rich : true
            }) );
            
            var layout = new qx.ui.layout.HBox();
            layout.setSpacing(5);
            var logos = new qx.ui.container.Composite(layout);

            //logos.add(new qx.ui.core.Spacer(), {flex: 1});
            var im = new qx.ui.basic.Image("resource/ife/logo/ife.jpg");
            im.set({scale:true});
            logos.add(  im);
            
            im = new qx.ui.basic.Image("resource/ife/logo/ens.jpg");
            im.set({scale:true});
            logos.add(  im);
            
            im = new qx.ui.basic.Image("resource/ife/logo/labexCortex.png");
            im.set({scale:true});
            logos.add(  im);
            
            
            im = new qx.ui.basic.Image("resource/ife/logo/labexPrimes.png");
            im.set({scale:true});
            logos.add(  im);
            
            
            
            scrollContainer.add(logos);

            
            
            
                        // "ok" button to close the window
            var alertBtn = new qx.ui.form.Button("OK");

            alertBtn.addListener("execute", win.close.bind(win));

            win.add(alertBtn);

            qx.core.Init.getApplication().getRoot().add(win, {left:20, top:20});

            button.addListener("execute", win.open.bind(win));

            return button;
        },


        profiling : function (volume) {
                var slicer = volume.getUserData("workerSlicer").slicer;
                var prop = volume.getUserData("workerSlicer").properties;
                console.log(prop);
                var dir = 0;
                var slice = 0;


                var t0 = performance.now();
                var sum = 0;

              function prof(dir) {
                slicer.generateSlice([slice, dir], function () {
                  slice++;
                  if (slice < prop.dimensions[dir])
                    this.profiling(dir, slice);
                  else {
                    var t1 = performance.now() - t0;
                    slice = 0;
                    t0 = performance.now();
                    sum +=t1;
                    console.log("PERFORMANCE " + dir + " (ns) : ", 1000*1000*t1/prop.dimensions[dir]/ prop.dimensions[(dir+1)%3]/ prop.dimensions[(dir+2)%3]);

                    console.log("PERFORMANCE " + dir + " (ms) : ", t1/prop.dimensions[dir]);
                    if (dir < 2) prof(dir+1);
                    else
                      console.log("end, total : ", sum);
                  }

                });
              }

              setTimeout(function () {
                  prof(0);
              }, 5000);

        },

        addAnatFile: function(evt) {
            var dialog = require('electron').remote.dialog;
            var filesList = dialog.showOpenDialog({
              filters : [
                {name: 'Anat Nifti Image', extensions: ['anat.nii.gz']},
                {name: 'Nifti Image', extensions: ['nii.gz']},
                {name: 'All Files', extensions: ['*']}

              ],
              properties: ['openFile']
            });

            if (!filesList || !filesList.length) return;
            var name = require("path").basename(filesList[0]);

            var that = this;

            if (name.substr(name.length -7) !== ".nii.gz") {
                dialog.showMessageBox({
                  type : "error",
                  title : "Erreur : type de fichier",
                  message : "Ne sont acceptés que les fichiers Nifti compressés (.nii.gz).",
                  buttons : ['Ok']
                });

                return;
            }

            this.removeAll();

            window.setTimeout(function() {
                that.__buttonOpenAnat.setEnabled(false);
            }, 1);

            this.__MPR.addVolume(filesList[0], {
                workerSlicer: true,
                noworker: true
            }, function(err, volume) {
                that.__volumeAnat = volume;
                volume.setUserData("path", filesList[0]);
/*
                that.__anatButtonMeta.exclude();
                that.loadMeta(volume, function (err, meta) {
                  if (err === null) { //show info button
                    that.__anatButtonMeta.show();
                  }
                  else { //show info button
                    that.__anatButtonMeta.exclude();
                  }
                });
*/

                var volSlice = that.__MPR.getVolumeSlices(volume);
                var meshes = that.__meshViewer.attachVolumeSlices(volSlice);

                that.__IRMAnatName.setValue(name.split(".")[0]);
                that.__buttonOpenFunc.setEnabled(true);
                that.__buttonOpenAnat.setEnabled(true);
                that.__subMenuAnat.show();

                that.__buttonCloseAll.setEnabled(true);

                var bbox = new THREE.Box3();
                meshes.forEach( function (obj) {
                    bbox.union( new THREE.Box3().setFromObject(obj) );
                });

                that.resetMeshView();
                var group = new THREE.Group();
                that.__meshViewer.addMesh(group);

                var center = bbox.max.add(bbox.min).divideScalar ( 2 ) ;
                var l = new THREE.Vector3().copy(bbox.max).sub(bbox.min);
                var maxSize = Math.max(l.x, l.y, l.z);

                //var size = 25;
                var size = 0.2*maxSize;

                group.add( that.createSprite("droite",  size, new THREE.Vector3(2*bbox.max.x-bbox.min.x+size*1.5, center.y, center.z)) );
                group.add( that.createSprite("gauche",  size, new THREE.Vector3(bbox.min.x-size*1.85, center.y, center.z)) );
                group.add( that.createSprite("ventre",  size, new THREE.Vector3(center.x, bbox.max.y*2+size*1.5, center.z)) );
                group.add( that.createSprite("dos",     size, new THREE.Vector3(center.x, bbox.min.y-size*1.25, center.z)) );
                group.add( that.createSprite("avant",   size, new THREE.Vector3(center.x, center.y, bbox.max.z*2+size*1.25)) );
                group.add( that.createSprite("arrière", size, new THREE.Vector3(center.x, center.y, bbox.min.z-size*1.25)) );

                //Update Zoom Limite
                that.__MPR.getViewers().concat(that.__meshViewer).forEach(function (viewer) {
                  viewer.getControls().setMinZoom(0.3*maxSize);
                  viewer.getControls().setMaxZoom(20*maxSize);
                });

                var path = filesList[0];
                if (path) {
                    var meshPath;
                    if (name.substr(name.length -12) == ".anat.nii.gz") {
                        meshPath = path.substr(0, path.length-12) + ".stl";
                    }
                    else if (name.substr(name.length -7) == ".nii.gz") {
                      var meshPath = path.substr(0, path.length-7) + ".stl";
                    }

                    var oReq = new XMLHttpRequest();
                    oReq.responseType = "arraybuffer";
                    oReq.onload = function (res) {
                       that.addMesh(oReq.response);
                    };
                    oReq.open("get", meshPath, true);
                    oReq.send();
                }
            });
        },



        addMeshFile: function(evt) {
            var file = evt.getData();
            var that = this;


            var name = file.getBrowserObject().name;


            if (name.substr(name.length -4) !== ".stl") {
                require('electron').remote.dialog.showMessageBox({
                  type : "error",
                  title : "Erreur : type de fichier",
                  message : "Ne sont acceptés que les maillages au format .stl",
                  buttons : ['Ok']
                });

                return;
            }


            this.removeMesh();

            var reader = new FileReader();
            reader.onload = function(e) {
                that.addMesh(e.target.result);
            }

            reader.readAsArrayBuffer(file.getBrowserObject());
        },

        addMesh : function (arrayBuffer) {
            var loader = new THREE.STLLoader();

            var geometry = loader.parse( arrayBuffer );

            //https://stackoverflow.com/questions/35843167/three-js-smoothing-normals-using-mergevertices
            var tempGeo = new THREE.Geometry().fromBufferGeometry(geometry);
            tempGeo.mergeVertices();
            // after only mergeVertices my textrues were turning black so this fixed normals issues
            tempGeo.computeVertexNormals();
            tempGeo.computeFaceNormals();
            geometry = new THREE.BufferGeometry().fromGeometry(tempGeo);

            //Rendering BackSide & Scale -1 pour être raccord avec les vues (hack : inversion des normales)
            var material = new THREE.MeshPhongMaterial( {
                  color: 0xff5533,
                  specular: 0x111111,
                  shininess: 50,
                  transparent : true,
                  opacity : 0.7,
                  side: THREE.BackSide } );

            var mesh = new THREE.Mesh( geometry, material );
            mesh.renderOrder = 4;

            mesh.scale.set(-1, 1, 1);

            var prop = this.__volumeAnat.getUserData('workerSlicer').properties;
            var offsetX = prop.dimensions[0] * prop.spacing[0];
            mesh.position.set(offsetX, 0, 0);


            mesh.flipSided = true;
            //flip every vertex normal in mesh by multiplying normal by -1
            for(var i = 0; i<mesh.geometry.attributes.normal.array.length; i++) {
                mesh.geometry.attributes.normal.array[i] = -mesh.geometry.attributes.normal.array[i];
            }

            mesh.material.needsUpdate = true;

            mesh.geometry.attributes.normal.needsUpdate = true; // required after the first render
            mesh.geometry.normalsNeedUpdate = true;

            this.__meshViewer.addMesh( mesh );
            this.__mesh3DModel = mesh;
            this.resetMeshView();
            this.__buttonCloseAll.setEnabled(true);
        },

        removeMesh : function () {
            /* TODO : remove mesh from viewer and dispose memory */
            if (this.__mesh3DModel) {
                this.__meshViewer.removeMesh(this.__mesh3DModel);
                this.__mesh3DModel = undefined;
            }
        },

        createCollapseButton: function() {
            var button = new qx.ui.basic.Image("resource/ife/left.png");
            button.set({
                width: 16,
                scale:true
            });
            var layout = new qx.ui.layout.VBox();
            layout.setAlignY("middle");
            var container = new qx.ui.container.Composite(layout);
            container.add(button);
            var that = this;
            button.addListener("click", function() {
                var target = that.getChildren()[0];
                if (target.isVisible()) {
                    target.exclude();
                    button.setSource("resource/ife/right.png");
                } else {
                    target.show();
                    button.setSource("resource/ife/left.png");
                }
            });
            return container;
        },

        createMPR: function() {
            //MPR container
            var options = {
                workerSlicer: true,
                alwaysDisplaySlider: true,
                zoomOnWheel: true,
                maxZoom:2000,
                minZoom:30
            };

            var MPR = new desk.MPRContainer(null, options);
            

            var meshViewer = this.__meshViewer = new desk.SceneContainer({
                  noOpts:true,
                  sliceOnWheel:false,
                  maxZoom:2000,
                  minZoom:30,
                  cameraFov : 35});

            var button = new qx.ui.form.Button(null, "resource/ife/reset.png").set({decorator: null});
            meshViewer.add (button, {right : 3, bottom : 3});
            var that = this;
            
            button.addListener("execute", function () {
              that.resetMeshView();
            });


            var screenshot = new qx.ui.form.Button(null, "resource/ife/screenshot.png").set({decorator: null});
            meshViewer.add (screenshot, {right : 38, bottom : 3});
            
            
            
            
            screenshot.addListener("execute", function () {
              var el = MPR.getContentElement().getDomElement(); 

              var rect = el.getBoundingClientRect();
              rect.y = rect.top;
              rect.x = rect.left;

              var remote = require('electron').remote;
              var webContents = remote.getCurrentWebContents();
              webContents.capturePage(rect, function (image) {
                var dialog = remote.dialog;
                var fn = dialog.showSaveDialog({
                  defaultPath: 'capture.png',
                  filters : [{name: 'Image', extensions: ['png']}]
                });
                if (fn && fn !== null)
                  remote.require('fs').writeFile(fn, image.toPNG());
              });
            });

            MPR.setCustomContainer(meshViewer);

            this.__MPR = MPR;
            return MPR;

        },

        link : function (target) {
            this.__MPR.link(target.__MPR);
            this.__meshViewer.link(target.__meshViewer);
        },

        unlink : function () {
            this.__MPR.__viewers.forEach (function (viewer) {
                viewer.unlink();
            });
            this.__meshViewer.unlink();
        },


        createSubMenuButtons: function() {
            var that = this;

            var layout = new qx.ui.layout.VBox();
            var container = new qx.ui.container.Composite(layout);

            layout.setSpacing(10);
            container.setPadding(10);
            container.setPaddingRight(0);

            /* Button Open Anat */

            var buttonOpenAnat = this.__buttonOpenAnat = new qx.ui.form.Button(this.tr("Ouvrir une image anatomique"), 'resource/ife/anat.png');
            console.log(buttonOpenAnat);

            buttonOpenAnat.getChildControl("label").setAllowGrowX(true);
            buttonOpenAnat.getChildControl("label").setTextAlign("left");

            buttonOpenAnat.addListener("execute", this.addAnatFile.bind(this));

            container.add(buttonOpenAnat);

            var buttonOpenFunc = this.__buttonOpenFunc = new qx.ui.form.Button(this.tr("Ouvrir un calque fonctionnel"), 'resource/ife/func.png');

            buttonOpenFunc.getChildControl("label").setAllowGrowX(true);
            buttonOpenFunc.getChildControl("label").setTextAlign("left");

            container.add(buttonOpenFunc);

            /* Button Close all */
            var buttonCloseAll = this.__buttonCloseAll = new qx.ui.form.Button(this.tr("Fermer cette image"), 'resource/ife/close.png');
            buttonCloseAll.getChildControl("label").setAllowGrowX(true);
            buttonCloseAll.getChildControl("label").setTextAlign("left");
            buttonCloseAll.addListener("execute", this.removeAll.bind(this));
            buttonCloseAll.setEnabled(false);
            container.add(buttonCloseAll);



            /* Button compare */
            if (that.__sideViewer) {
                var buttonCompare = new qx.ui.form.Button(this.tr("Comparer deux images"), 'resource/ife/compare.png');
                buttonCompare.getChildControl("label").setAllowGrowX(true);
                buttonCompare.getChildControl("label").setTextAlign("left");
            
                buttonCompare.addListener("execute", function () {
                    if (that.__sideViewer.isVisible()) {
                        that.__sideViewer.exclude();
                        buttonCompare.setLabel(that.tr("Comparer deux images"));
                        //that.unlink();

                        that.switchMenu(true);
                        that.__sideViewer.switchMenu(true);

                    } else {
                        that.__sideViewer.__MPR.resetMaximize();
                        that.__sideViewer.show();
                        buttonCompare.setLabel(that.tr("Fermer la comparaison"));
                        //that.link(that.__sideViewer);

                        that.switchMenu(false);
                        that.__sideViewer.switchMenu(false);

                    }
                });

                container.add(buttonCompare);
            }

            return container;

        },

        switchMenu : function (vertical) {
            var layout = vertical ? new qx.ui.layout.HBox() : new qx.ui.layout.VBox();
            this.setLayout(layout);

            this.remove(this.__menu);

            var menu = this.__menu = new qx.ui.container.Composite(vertical ? new qx.ui.layout.VBox() : new qx.ui.layout.HBox()).set({height:210, backgroundColor: this.__backgroundColor});
            menu.add(new qx.ui.core.Spacer(), {flex: 1});
            menu.add(this.__subMenuButtons);

            var target, parent;
            if (vertical) {
                menu.setPadding(5);
                
                menu.addAt(this.__burger, 0);
                this.__burger.setSource("resource/ife/menu_left.png");
                parent = new qx.ui.container.Scroll().set({});
                target = new qx.ui.container.Composite(new qx.ui.layout.VBox().set({spacing:20}));
                parent.add(target, {flex: 1});
            }
            else { //compare mode
                this.__burger.setSource("resource/ife/menu_bottom.png");
                parent = new qx.ui.container.Scroll().set({ maxHeight: 200 });
                target = new qx.ui.container.Composite(new qx.ui.layout.VBox().set({spacing:10}));

                parent.add(target, {flex: 1});
            }

            target.add(this.__subMenuAnat);
            target.add(this.__subMenuFunc[0]);
            target.add(this.__subMenuFunc[1]);
            target.add(this.__subMenuFunc[2]);


            menu.add(new qx.ui.core.Spacer(), {flex: 1});

            if (parent !== menu) menu.add(parent);

            menu.add(new qx.ui.core.Spacer(), {flex: 1});

            this.addAt(menu, vertical?0:1);

            if (vertical) 
            {
              menu.add(this.createAbout());
              this.__burger.setAlignY("top");
            }
            else if (this.__sideViewer) 
            {
              this.__burger.setAlignY("middle");
              menu.add(this.__burger);
            }
        },


        createSubMenuAnat: function() {
            var that = this;

            var layout = new qx.ui.layout.VBox();
            var container = new qx.ui.container.Composite(layout).set({
              minWidth:200,
              maxWidth:250
            });

            //container.add(new qx.ui.core.Widget().set({height:1, backgroundColor:"gray"}));

            var titleContainer = new qx.ui.container.Composite(new qx.ui.layout.HBox());

                titleContainer.add(new qx.ui.basic.Label().set({
                    value: "<b>" + this.tr("Image anatomique") + " : </b>",
                    rich: true
                }));

                titleContainer.add(new qx.ui.core.Spacer(), {flex: 1});

/*
                var button_meta = this.__anatButtonMeta = new qx.ui.form.Button(null, 'resource/ife/info_small.png').set({
                    decorator: null
                });
                titleContainer.add(button_meta);
                button_meta.addListener("execute", function() {
                    that.showMeta(that.__volumeAnat);
                });
*/

            container.add(titleContainer);

            this.__IRMAnatName = new qx.ui.basic.Label().set({
                rich: true,
                wrap : true,
                maxWidth:250
            });

            this.__IRMAnatName.setAllowGrowX(false);

            container.add(this.__IRMAnatName);


            /* Gestion du contraste */
            var contrastLabel = new qx.ui.basic.Label(this.tr("Contraste") + " : <b>1.00</b>").set({rich:true});
            container.add(contrastLabel);
            var contrastSlider = this.contrastSlider = new qx.ui.form.Slider();
            contrastSlider.set({
                minimum: -40,
                maximum: 40,
                singleStep: 1,
                backgroundColor:"white"
            });
            contrastSlider.addListener("changeValue", function(e) {
                var value = Math.pow(10, e.getData() / 40);
                contrastLabel.setValue(that.tr("Contraste") + " : <b>" + value.toFixed(2) + "</b>");
                if (that.__volumeAnat) {
                  that.__volumeAnat.getUserData('slices').forEach(function(volumeSlice) {
                      volumeSlice.setContrast(value);
                  });
                }
            });
            container.add(contrastSlider);


            /* Gestion de la luminosité */
            var brightnessLabel = new qx.ui.basic.Label(this.tr("Luminosité") + " : <b>0.5</b>").set({rich:true});
            container.add(brightnessLabel);
            var brightnessSlider = this.brightnessSlider = new qx.ui.form.Slider();
            brightnessSlider.set({
                minimum: 0,
                maximum: 100,
                singleStep: 1,
                value : 50,
                backgroundColor:"white"
            });
            brightnessSlider.addListener("changeValue", function(e) {
                var value = e.getData() / 100;
                brightnessLabel.setValue(that.tr("Luminosité") + " : <b>" + value.toFixed(2)+"</b>");
                if (that.__volumeAnat) {
                  that.__volumeAnat.getUserData('slices').forEach(function(volumeSlice) {
                      volumeSlice.setBrightness((value-0.5)*2 );
                  });
                }
            });
            container.add(brightnessSlider);
            container.add(new qx.ui.core.Spacer(), {flex: 0.5});
            //container.add(new qx.ui.core.Widget().set({height:1, backgroundColor:"gray"}));
            container.add(new qx.ui.core.Spacer(), {flex: 0.5});
            return container;
        },

        showMeta : function (volume) {
            var metadonnees = volume.getUserData("metadonnees");
            var that = this;

            if (!metadonnees) {
              require('electron').remote.dialog.showMessageBox({
                type : "error",
                title : "Erreur",
                message : "Métadonnées indisponibles",
                buttons : ['Ok']
              });
            }

            var parser = new DOMParser();
            var xmlDoc = parser.parseFromString(metadonnees,"text/xml");
            var lom = xmlDoc.getElementsByTagName("lom")[0];
            var general = lom.getElementsByTagName("general")[0];
            
            var title       = general.getElementsByTagName("title")[0].childNodes[0].childNodes[0].nodeValue;
            
            
            var description = this.nl2br(general.getElementsByTagName("description")[0].childNodes[0].childNodes[0].nodeValue.trim() );
            

            var contributeursNodeList = lom.getElementsByTagName("lifeCycle")[0].getElementsByTagName("contribute");
            
            var contributeurs = [];
            
            for(var i = 0;i < contributeursNodeList.length; i++)
            {
                contributeurs.push(contributeursNodeList[i].getElementsByTagName("entity")[0].childNodes[0].nodeValue);
            }
                        
            
            var txt = "<h2>"+title+"</h2>"
              + "<h4>Description</h4>" + description + "<br>"
              + "<h4>Contributeurs : </h4>"
              + "<ul>";
              
           contributeurs.forEach(function (contributeur) {
              txt += "<li>" + contributeur + "</li>";
           });
           
           txt += "</ul>";
            
            
            this.alert(txt, "Métadonnées", { width : 800 } );
            
            
        },


        nl2br : function (str, is_xhtml) {
          var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br ' + '/>' : '<br>'; 
          return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
        },
        
        loadMeta : function (volume, callback) {
            var path = volume.getUserData("path");
            path = path.substr(0, path.length-7) + ".xml";
 
            var oReq = new XMLHttpRequest();
            oReq.onload = function (res) {
               volume.setUserData("metadonnees", this.responseText);
               console.log("HERE !!!");
               callback(null, this.responseText);
            };

            oReq.onerror = function () {
                callback("error");
            };

            oReq.open("get", path, true);
            oReq.send();
        },

        removeAll: function() {
          this.__subMenuFunc[0].removeFunc();
          this.__subMenuFunc[1].removeFunc();
          this.__subMenuFunc[2].removeFunc();

            this.__MPR.removeAllVolumes();
            this.__MPR.resetMaximize();
            if (this.__sideViewer)
              this.__sideViewer.__MPR.resetMaximize();
            this.__meshViewer.removeAllMeshes();

            this.__IRMAnatName.setValue("");

            this.__buttonOpenFunc.setEnabled(false);

            this.__subMenuAnat.hide();

            this.__volumeAnat = undefined;

            this.__buttonCloseAll.setEnabled(false);

            this.contrastSlider.set({value : 0});
            this.brightnessSlider.set({value : 50});


        },

        resetMeshView : function () {
            this.__meshViewer.resetView()
            this.__meshViewer.rotateView(0, -0.5 * Math.PI, 0);
            this.__meshViewer.rotateView(0.75 * Math.PI, 0, 0);
            this.__meshViewer.rotateView(0, 0.1 * Math.PI, 0);
        },

        createSprite : function (text, size, position) {
            if (!size) size = 100;

            var height = 128;

            var canvas = document.createElement('canvas');
            canvas.height = height;


            var context = canvas.getContext("2d");

            context.font = Math.floor(height*0.6) + 'px Helvetica Arial';

            var width = context.measureText(text).width //* height / 10;

            canvas.width = Math.pow(2, Math.ceil(Math.log(width+100) / Math.log(2)));

            var texture = new THREE.Texture(canvas);

            context.clearRect(0, 0, canvas.width, canvas.height);

            context.font = Math.floor(height*0.6) + 'px Helvetica';

            context.fillStyle = "deepskyblue";
            context.fillText(text, (canvas.width-width)/2, height*0.8);
            texture.needsUpdate = true;

            var material = new THREE.SpriteMaterial({map :texture});
            var mesh = new THREE.Sprite(material);

            mesh.position.copy(position); //.add( new THREE.Vector3(size * width/ height /2, size/2, 0 ) );
            mesh.scale.x = size * canvas.width/ height;
            mesh.scale.y = size;

            return mesh;
        }




    }
});
