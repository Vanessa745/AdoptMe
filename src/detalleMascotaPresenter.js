import  MascotaRepository  from './infraestructure/MascotaRepository.js';   
import { buildImgUrl } from './services/ObtenerImagenMascotaService.js';

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(globalThis.location.search);
    const idMascota = params.get('id');
    
    const detalleDiv = document.querySelector("#detalle-div");


    let detallesMascota;
    const mascotaRepository = new MascotaRepository();

    // Si no obtuvimos detalles desde API, usamos el fallback por nombre/local
    if (idMascota) {
        detallesMascota = await mascotaRepository.obtenerDetalleMascotaPorId(idMascota);
    }
    
    // Limpiamos el contenedor antes de armar el contenido
    detalleDiv.innerHTML = "";

    
    if (typeof detallesMascota === "string") {
        const p = document.createElement('p');
        p.textContent = detallesMascota;
        detalleDiv.appendChild(p);
    } else {
        

        // Contenedor de información
        const infoContainer = document.createElement('div');
        infoContainer.className = 'detalle-info';

        const fields = [
            ['Nombre', detallesMascota.nombre],
            ['Especie', detallesMascota.especie],
            ['Raza', detallesMascota.raza],
            ['Edad', detallesMascota.edad],
            ['Género', detallesMascota.sexo],
            ['Estado', detallesMascota.estado],
            ['Facilitador', detallesMascota.facilitador]
        ];

        fields.forEach(([label, value]) => {
            const item = document.createElement('div');
            item.className = 'detalle-item';

            const lab = document.createElement('div');
            lab.className = 'detalle-label';
            lab.textContent = label;

            const val = document.createElement('div');
            val.className = 'detalle-value';
            val.textContent = value;

            item.appendChild(lab);
            item.appendChild(val);
            infoContainer.appendChild(item);
        });

        detalleDiv.appendChild(infoContainer);

        const img = document.createElement('img');

        img.src = buildImgUrl(detallesMascota.img_ref) || '';
        img.alt = `Foto de ${detallesMascota.nombre || 'mascota'}`;
        img.className = 'detalle-imagen';
        detalleDiv.appendChild(img);

        // Botón Adoptar dentro del contenedor de detalle
        const adoptBtn = document.createElement('button');
        adoptBtn.id = 'adoptBtn';
        adoptBtn.type = 'button';
        adoptBtn.className = 'adopt-btn';
        adoptBtn.textContent = 'Adoptar';
        // Navega a la pantalla de adopción (se crea `adoptarMascota.html` en src/UI)
        const targetName =  detallesMascota.id;
        adoptBtn.addEventListener('click', () => {            

            const q = targetName ? ('?id=' + encodeURIComponent(targetName)) : '';
            globalThis.location.href = './FormSolicitudAdopcion.html' + q;
        });
        if (detallesMascota.estado === 'Adoptado') {
            adoptBtn.style.display = 'none';
        
        }
        detalleDiv.appendChild(adoptBtn);
    }
});