# Bugs — Stride

## Otvorené

- **Kategórie — farby skryté za klávesnicou** (`CategoriesSheet.vue`) — pri pridávaní novej kategórie na mobile sa paleta farieb schová za klávesnicu keď sa klikne na input. Riešenie: `scrollIntoView` pri focuse + väčší `padding-bottom` na `.sheet`.
