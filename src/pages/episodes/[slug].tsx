import { useRouter } from 'next/router'

import {format, parseISO} from 'date-fns';
import Image from 'next/image';
import {GetStaticPaths, GetStaticProps} from 'next';
import {api} from '../../services/api'
import ptBR from 'date-fns/locale/pt-BR';
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';
import styles from './episode.module.scss';
import Link from 'next/link';
import { usePlayer } from '../../contexts/PlayerContext';
import React from 'react';
import Head from 'next/head';

type Episode = {
    
        id: string;
        title: string;
        thumbnail: string;
        members:string;         
        duration: number;
        publishedAt: string;
        durationAsString: string;
        url: string;
        description: string;
    
};

type EpisodeProps = {

    episode: Episode;
}

export const getStaticPaths: GetStaticPaths = async () =>{

    return{
        paths:[],
        fallback:'blocking'
    }

}


export default function Episode( {episode}: EpisodeProps ) {

    const {play} = usePlayer();

    return (
        <div className= {styles.episode}>

            <Head>
                <title>{episode.title} | Podcast </title>
            </Head>
            <div className= {styles.thumbnailContainer}>
                <Link href="/">
                    <button type= "button">
                        <img src="/arrow-left.svg" alt="Voltar"/>
                    </button>
                </Link>

                
                <Image width={700} height= {160} src= {episode.thumbnail} alt= {episode.title} objectFit= "cover"/>
                <button type= "button" onClick={() => play(episode)}>
                    <img src= "/play.svg" alt="Tocar episodio"/>
                </button>
            </div>

            <header>
                <h1>{episode.title}</h1>
                <span>{episode.members}</span>
                <span>{episode.publishedAt}</span>
                <span>{episode.durationAsString}</span>
            </header>
            <div className= {styles.description} 
            dangerouslySetInnerHTML= {{__html: episode.description}}/>
            
        </div>
    )
}

export const getStaticProps: GetStaticProps = async(ctx) =>{

    const {slug} = ctx.params;
    const {data} = await api.get(`/episodes/${slug}`)
    const episode = {
        id: data.id,
      title: data.title,
      thumbnail: data.thumbnail,
      members: data.members,
      publishedAt: format(parseISO(data.published_at), 'd MMM yy', {locale: ptBR}),
      duration: Number(data.file.duration),
      durationAsString: convertDurationToTimeString(Number(data.file.duration)),
      description: data.description,
      url: data.file.url,
    }

    return{ 
        props:{
            episode,
        },
        revalidate: 60 * 60 * 24,
    }
}