use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct SoftClip {
    drive: f32,
}

#[wasm_bindgen]
impl SoftClip {
    
    #[wasm_bindgen(constructor)]
    pub fn new(drive: f32) -> SoftClip {
        SoftClip { drive }
    }

    pub fn process(&self, buffer: &mut [f32]) {

        for x in buffer.iter_mut() {
            *x = ((self.drive * *x).tanh()) / (self.drive.tanh()) / self.drive.max(1.0);
        }
    }

    pub fn get_drive(&self) -> f32 {
        self.drive
    }

    pub fn set_drive(&mut self, drive: f32) {
        self.drive = drive
    }
}