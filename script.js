const API = "https://pokeapi.co/api/v2";
const foto = (id) => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
const idDe = (url) => url.split("/").filter(Boolean).pop();
const pedir = (url) => fetch(url).then((r) => r.json());
const $ = (id) => document.getElementById(id);
let urls = [], pos = 0;


function tarjeta(especie, activo) {
  const id = idDe(especie.url);
  const b = document.createElement("button");
  b.className = id == activo ? "activo" : "";
  b.innerHTML = `<img src="${foto(id)}"><br>${especie.name}`;
  b.onclick = () => abrir(id);
  return b;
}


async function abrir(id) {
  const esp = await pedir(`${API}/pokemon-species/${id}`);
  const cadena = await pedir(esp.evolution_chain.url);
  $("foto").src = foto(id);
  $("nombre").textContent = `${esp.name} #${esp.id}`;
  $("previo").textContent = esp.evolves_from_species ? `Evoluciona de ${esp.evolves_from_species.name}` : "Forma inicial";
  $("arbol").replaceChildren(dibujar(cadena.chain, id));
  if (!$("detalle").open) $("detalle").showModal();
}


const como = (d) =>
  !d ? ""
  : d.min_level ? `Nv. ${d.min_level}`
  : d.item ? d.item.name
  : d.trigger.name;


function dibujar(nodo, activo, texto) {
  const rama = document.createElement("div");
  rama.className = "rama";
  if (texto !== undefined) rama.innerHTML = `<span class="flecha">${texto}<br>→</span>`;
  rama.append(tarjeta(nodo.species, activo));
  const hijos = document.createElement("div");
  nodo.evolves_to.forEach((h) => hijos.append(dibujar(h, activo, como(h.evolution_details[0]))));
  rama.append(hijos);
  return rama;
}


async function cargarMas() {
  $("mas").disabled = true;
  const familias = await Promise.all(urls.slice(pos, pos + 30).map(pedir));
  pos += 30;
  familias.filter((f) => f.chain.evolves_to.length).forEach((f) => $("lista").append(tarjeta(f.chain.species)));
  $("mas").disabled = pos >= urls.length;
}

$("mas").onclick = cargarMas;
$("cerrar").onclick = () => $("detalle").close();
$("detalle").onclick = (e) => e.target == $("detalle") && $("detalle").close();

pedir(`${API}/evolution-chain?limit=600`).then((d) => { urls = d.results.map((r) => r.url); cargarMas(); });

