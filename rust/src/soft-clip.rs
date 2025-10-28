use wasm_bindgen::prelude::*;

pub fn soft_clip(buffer &mut [f32], clip_level: f32) {
    for sample in buffer.iter_mut() {
        if *sample > clip_level {
            *sample = clip_level + (*sample - clip_level) / (1.0 + ((*sample - clip_level) / (1.0 - clip_level)).powi(2));
        } else if *sample < -clip_level {
            *sample = -clip_level + (*sample + clip_level) / (1.0 + ((*sample + clip_level) / (1.0 - clip_level)).powi(2));
        }
    }
}