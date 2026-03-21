function MarcarEstado(estado){
  if(estado === "adoptado"){
    return"La mascota ha sido marcada como adoptado.";
  } else {
    return"La mascota ha sido marcada como " + estado + " para adopción.";
  }
}

export {MarcarEstado};