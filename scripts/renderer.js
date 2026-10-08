import * as CG from './transforms.js';
import { Matrix } from "./matrix.js";


class Renderer {
    // canvas:              object ({id: __, width: __, height: __})
    // limit_fps_flag:      bool 
    // fps:                 int
    constructor(canvas, limit_fps_flag, fps) {
        this.canvas = document.getElementById(canvas.id);
        this.canvas.width = canvas.width;
        this.canvas.height = canvas.height;
        this.ctx = this.canvas.getContext('2d');
        this.slide_idx = 0;
        this.limit_fps = limit_fps_flag;
        this.fps = fps;
        this.start_time = null;
        this.prev_time = null;

        this.models = {
            slide0: [
                // example model (diamond) -> should be replaced with actual model
                {
                    vertices: [
                        CG.Vector3(400, 150, 1),
                        CG.Vector3(500, 300, 1),
                        CG.Vector3(400, 450, 1),
                        CG.Vector3(300, 300, 1)
                    ],
                    transform: null
                }
            ],
            slide1: [],
            slide2: [],
            slide3: [
                {
                    vertices: [
                        CG.Vector3(300, 100, 1),
                        CG.Vector3(300, 300, 1),
                        CG.Vector3(500, 300, 1),
                        CG.Vector3(500, 100, 1)
                    ],
                    transform: null,
                    tx: 0,
                    tx_velocity: 10,
                    ty: 0,
                    ty_velocity: 0,
                    sx: 0.1,
                    sx_velocity: 0.05,
                    sx_direction: 1,
                    sy: 0.1,
                    sy_velocity: 0.05,
                    sy_direction: 1,
                    theta: 0,
                    theta_velocity: Math.PI / 16
                },
                {
                    vertices: [
                        CG.Vector3(50, 100, 1),
                        CG.Vector3(50, 300, 1),
                        CG.Vector3(250, 300, 1),
                        CG.Vector3(250, 100, 1)
                    ],
                    transform: null,
                    tx: 0,
                    tx_velocity: 10,
                    ty: 0,
                    ty_velocity: 0,
                    sx: 1.1,
                    sx_velocity: 0.05,
                    sx_direction: -1,
                    sy: 1.1,
                    sy_velocity: 0.05,
                    sy_direction: -1,
                    theta: 0,
                    theta_velocity: Math.PI / 16
                },
                {
                    vertices: [
                        CG.Vector3(50, 350, 1),
                        CG.Vector3(50, 550, 1),
                        CG.Vector3(250, 550, 1),
                        CG.Vector3(250, 350, 1)
                    ],
                    transform: null,
                    tx: 0,
                    tx_velocity: -10,
                    ty: 0,
                    ty_velocity: 0,
                    sx: 0.1,
                    sx_velocity: 0.05,
                    sx_direction: 1,
                    sy: 0.1,
                    sy_velocity: 0.05,
                    sy_direction: 1,
                    theta: 0,
                    theta_velocity: Math.PI / 16
                },
                {
                    vertices: [
                        CG.Vector3(300, 350, 1),
                        CG.Vector3(300, 550, 1),
                        CG.Vector3(500, 550, 1),
                        CG.Vector3(500, 350, 1)
                    ],
                    transform: null,
                    tx: 0,
                    tx_velocity: -10,
                    ty: 0,
                    ty_velocity: 0,
                    sx: 1.1,
                    sx_velocity: 0.05,
                    sx_direction: -1,
                    sy: 1.1,
                    sy_velocity: 0.05,
                    sy_direction: -1,
                    theta: 0,
                    theta_velocity: Math.PI / 16
                },
                {
                    vertices: [
                        CG.Vector3(550, 350, 1),
                        CG.Vector3(550, 550, 1),
                        CG.Vector3(750, 550, 1),
                        CG.Vector3(750, 350, 1)
                    ],
                    transform: null,
                    tx: 0,
                    tx_velocity: 10,
                    ty: 0,
                    ty_velocity: 0,
                    sx: 0.1,
                    sx_velocity: 0.05,
                    sx_direction: 1,
                    sy: 0.1,
                    sy_velocity: 0.05,
                    sy_direction: 1,
                    theta: 0,
                    theta_velocity: Math.PI / 16
                },
                {
                    vertices: [
                        CG.Vector3(550, 100, 1),
                        CG.Vector3(550, 300, 1),
                        CG.Vector3(750, 300, 1),
                        CG.Vector3(750, 100, 1)
                    ],
                    transform: null,
                    tx: 0,
                    tx_velocity: 10,
                    ty: 0,
                    ty_velocity: 0,
                    sx: 1.1,
                    sx_velocity: 0.05,
                    sx_direction: -1,
                    sy: 1.1,
                    sy_velocity: 0.05,
                    sy_direction: -1,
                    theta: 0,
                    theta_velocity: Math.PI / 16
                },
            ]
        };
    }

    // flag:  bool
    limitFps(flag) {
        this.limit_fps = flag;
    }

    // n:  int
    setFps(n) {
        this.fps = n;
    }

    // idx: int
    setSlideIndex(idx) {
        this.slide_idx = idx;
    }

    animate(timestamp) {
        // Get time and delta time for animation
        if (this.start_time === null) {
            this.start_time = timestamp;
            this.prev_time = timestamp;
        }
        let time = timestamp - this.start_time;
        let delta_time = timestamp - this.prev_time;
        //console.log('animate(): t = ' + time.toFixed(1) + ', dt = ' + delta_time.toFixed(1));

        // Update transforms for animation
        this.updateTransforms(time, delta_time);

        // Draw slide
        this.drawSlide();

        // Invoke call for next frame in animation
        if (this.limit_fps) {
            setTimeout(() => {
                window.requestAnimationFrame((ts) => {
                    this.animate(ts);
                });
            }, Math.floor(1000.0 / this.fps));
        }
        else {
            window.requestAnimationFrame((ts) => {
                this.animate(ts);
            });
        }

        // Update previous time to current one for next calculation of delta time
        this.prev_time = timestamp;
    }

    //
    updateTransforms(time, delta_time) {

        for (let i = 0; i < 6; i++) {

            if (this.models.slide3[i].transform == null) {
                this.models.slide3[i].transform = [
                    this.models.slide3[i].vertices[0],
                    this.models.slide3[i].vertices[1],
                    this.models.slide3[i].vertices[2],
                    this.models.slide3[i].vertices[3]
                ];
            }

            let center_x = (this.models.slide3[i].vertices[0].values[0][0] + this.models.slide3[i].vertices[2].values[0][0]) / 2;
            let center_y = (this.models.slide3[i].vertices[0].values[1][0] + this.models.slide3[i].vertices[2].values[1][0]) / 2;

            let to_origin = new Matrix(3, 3);
            CG.mat3x3Translate(to_origin, -1 * center_x, -1 * center_y);

            let to_center = new Matrix(3, 3);
            CG.mat3x3Translate(to_center, center_x, center_y);
        
            if (center_x + this.models.slide3[i].tx > 650) {
                this.models.slide3[i].tx = 650 - center_x;
                this.models.slide3[i].tx_velocity = 0;
                this.models.slide3[i].ty_velocity = 10;
            }
            if (center_x + this.models.slide3[i].tx < 150) {
                this.models.slide3[i].tx = 150 - center_x;
                this.models.slide3[i].tx_velocity = 0;
                this.models.slide3[i].ty_velocity = -10;
            }
            if (center_y + this.models.slide3[i].ty > 450) {
                this.models.slide3[i].ty = 450 - center_y;
                this.models.slide3[i].tx_velocity = -10;
                this.models.slide3[i].ty_velocity = 0;
            }
            if (center_y + this.models.slide3[i].ty < 200) {
                this.models.slide3[i].ty = 200 - center_y;
                this.models.slide3[i].tx_velocity = 10;
                this.models.slide3[i].ty_velocity = 0;
            }

            this.models.slide3[i].tx += this.models.slide3[i].tx_velocity * delta_time / 100;
            this.models.slide3[i].ty += this.models.slide3[i].ty_velocity * delta_time / 100;

            let translate = new Matrix(3, 3);
            CG.mat3x3Translate(translate, this.models.slide3[i].tx, this.models.slide3[i].ty);

            this.models.slide3[i].sx += this.models.slide3[i].sx_direction * this.models.slide3[i].sx_velocity * delta_time / 100;
            if (this.models.slide3[i].sx > 1) {
                this.models.slide3[i].sx_direction = -1;
            }
            if (this.models.slide3[i].sx < 0.1) {
                this.models.slide3[i].sx_direction = 1;
            }

            this.models.slide3[i].sy += this.models.slide3[i].sy_direction * this.models.slide3[i].sy_velocity * delta_time / 100;
            if (this.models.slide3[i].sy > 1) {
                this.models.slide3[i].sy_direction = -1;
            }
            if (this.models.slide3[i].sy < 0.1) {
                this.models.slide3[i].sy_direction = 1;
            }
            
            let scale = new Matrix(3, 3);
            CG.mat3x3Scale(scale, this.models.slide3[i].sx, this.models.slide3[i].sy);

            this.models.slide3[i].theta = (this.models.slide3[i].theta + this.models.slide3[i].theta_velocity * delta_time / 100) % (2 * Math.PI);

            let rotate = new Matrix(3, 3);
            CG.mat3x3Rotate(rotate, this.models.slide3[i].theta);

            this.models.slide3[i].transform = [
                Matrix.multiply([translate, to_center, scale, rotate, to_origin, this.models.slide3[i].vertices[0]]),
                Matrix.multiply([translate, to_center, scale, rotate, to_origin, this.models.slide3[i].vertices[1]]),
                Matrix.multiply([translate, to_center, scale, rotate, to_origin, this.models.slide3[i].vertices[2]]),
                Matrix.multiply([translate, to_center, scale, rotate, to_origin, this.models.slide3[i].vertices[3]])
            ];
        }



        /*
        let center_x = (this.models.slide3[0].vertices[0].values[0][0] + this.models.slide3[0].vertices[2].values[0][0]) / 2.0;
        let center_y = (this.models.slide3[0].vertices[0].values[1][0] + this.models.slide3[0].vertices[2].values[1][0]) / 2.0;

        let to_origin = new Matrix(3, 3);
        CG.mat3x3Translate(to_origin, -1 * center_x, -1 * center_y);

        let to_center = new Matrix(3, 3);
        CG.mat3x3Translate(to_center, center_x, center_y);

        this.models.slide3[0].tx += this.models.slide3[0].tx_velocity * delta_time / 100;
        if (this.models.slide3[0].tx >= center_x) {
            this.models.slide3[0].tx_velocity *= -1;
        }
        if (this.models.slide3[0].tx <= -1 * center_x) {
            this.models.slide3[0].tx_velocity *= -1;
        }

        let translate = new Matrix(3, 3);
        CG.mat3x3Translate(translate, this.models.slide3[0].tx, this.models.slide3[0].ty);

        this.models.slide3[0].sx += this.models.slide3[0].sx_direction * this.models.slide3[0].sx_velocity * delta_time / 100;
        if (this.models.slide3[0].sx > 1.5) {
            this.models.slide3[0].sx_direction = -1;
        }
        if (this.models.slide3[0].sx < 0.5) {
            this.models.slide3[0].sx_direction = 1;
        }

        this.models.slide3[0].sy += this.models.slide3[0].sy_direction * this.models.slide3[0].sy_velocity * delta_time / 100;
        if (this.models.slide3[0].sy > 1.5) {
            this.models.slide3[0].sy_direction = -1;
        }
        if (this.models.slide3[0].sy < 0.5) {
            this.models.slide3[0].sy_direction = 1;
        }
        
        let scale = new Matrix(3, 3);
        CG.mat3x3Scale(scale, this.models.slide3[0].sx, this.models.slide3[0].sy);

        this.models.slide3[0].theta = (this.models.slide3[0].theta + this.models.slide3[0].theta_velocity * delta_time / 100) % (2 * Math.PI);

        let rotate = new Matrix(3, 3);
        CG.mat3x3Rotate(rotate, this.models.slide3[0].theta);

        this.models.slide3[0].transform = [
            Matrix.multiply([translate, to_center, rotate, scale, to_origin, this.models.slide3[0].vertices[0]]),
            Matrix.multiply([translate, to_center, rotate, scale, to_origin, this.models.slide3[0].vertices[1]]),
            Matrix.multiply([translate, to_center, rotate, scale, to_origin, this.models.slide3[0].vertices[2]]),
            Matrix.multiply([translate, to_center, rotate, scale, to_origin, this.models.slide3[0].vertices[3]])
        ];
        */
    }
    
    //
    drawSlide() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        switch (this.slide_idx) {
            case 0:
                this.drawSlide0();
                break;
            case 1:
                this.drawSlide1();
                break;
            case 2:
                this.drawSlide2();
                break;
            case 3:
                this.drawSlide3();
                break;
        }
    }

    //
    drawSlide0() {
        // TODO: draw bouncing ball (circle that changes direction whenever it hits an edge)
        
        
        // Following lines are example of drawing a single polygon
        // (this should be removed/edited after you implement the slide)
        let teal = [0, 128, 128, 255];
        this.drawConvexPolygon(this.models.slide0[0].vertices, teal);
    }

    //
    drawSlide1() {
        // TODO: draw at least 3 polygons that spin about their own centers
        //   - have each polygon spin at a different speed / direction
        
        
    }

    //
    drawSlide2() {
        // TODO: draw at least 2 polygons grow and shrink about their own centers
        //   - have each polygon grow / shrink different sizes
        //   - try at least 1 polygon that grows / shrinks non-uniformly in the x and y directions


    }

    //
    drawSlide3() {
        let red = [255, 0, 0, 255];
        let orange = [255, 125, 0, 255];
        let yellow = [255, 255, 0, 255];
        let green = [0, 255, 0, 255];
        let blue = [0, 0, 255, 255];
        let purple = [255, 0, 255, 255];
        this.drawConvexPolygon(this.models.slide3[0].transform, red);
        this.drawConvexPolygon(this.models.slide3[1].transform, orange);
        this.drawConvexPolygon(this.models.slide3[2].transform, yellow);
        this.drawConvexPolygon(this.models.slide3[3].transform, green);
        this.drawConvexPolygon(this.models.slide3[4].transform, blue);
        this.drawConvexPolygon(this.models.slide3[5].transform, purple);
    }
    
    // vertex_list:  array of object [Matrix(3, 1), Matrix(3, 1), ..., Matrix(3, 1)]
    // color:        array of int [R, G, B, A]
    drawConvexPolygon(vertex_list, color) {
        this.ctx.fillStyle = 'rgba(' + color[0] + ',' + color[1] + ',' + color[2] + ',' + (color[3] / 255) + ')';
        this.ctx.beginPath();
        let x = vertex_list[0].values[0][0] / vertex_list[0].values[2][0];
        let y = vertex_list[0].values[1][0] / vertex_list[0].values[2][0];
        this.ctx.moveTo(x, y);
        for (let i = 1; i < vertex_list.length; i++) {
            x = vertex_list[i].values[0][0] / vertex_list[i].values[2][0];
            y = vertex_list[i].values[1][0] / vertex_list[i].values[2][0];
            this.ctx.lineTo(x, y);
        }
        this.ctx.closePath();
        this.ctx.fill();
    }
};

export { Renderer };
