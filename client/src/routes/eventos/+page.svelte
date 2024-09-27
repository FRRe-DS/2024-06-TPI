<script>
//    require('dotenv').config();
    import { onMount} from 'svelte';
    import axios from 'axios';


    let cards = [ { image: 'src/public/pablopicasso.png',
        eventName: 'el mejor evento',
        eventStartDate: '20/20/2020',
        eventFinishDate: '20/20/2020',
        content: 'una maravilla',
        title:  "obra 1" }];


    onMount(async () => {
        try{
            const res= await axios.get('http://localhost:3000/api/eventos')
            console.log(res.data)
            cards=res.data
        } catch (error){
            console.log(error)
        }

    });
    // Ejemplo de datos para las cards
</script>

<!-- Contenedor de las cards -->
<div class="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 p-4">
    {#each cards as card}
        <div class="block rounded-lg bg-white shadow-secondary-1 m-2.5 border-2 border-gray-300 rounded-md">
            <div class="relative overflow-hidden bg-cover bg-no-repeat">
                <img class="rounded-t-lg" src={card.image} alt={card.title} />
                
            </div>
            <div class="p-6 text-surface dark:text-white">
                <h5 class="mb-2 text-xl font-medium leading-tight text-black">{card.eventName}</h5>
                <span class="text-cyan-900">{card.eventStartDate} - {card.eventFinishDate}</span>
                <p class="mb-4 text-base text-left text-black">{card.content}</p>
            </div>
        </div>
    {/each}
</div>

