---
title: "[Next.js] 세팅"
tags: ["Next.js"]
date: 2023-07-05
notion_id: b7be6436-8566-4799-91a5-d5199a45ee24
notion_last_edited: 2026-06-28T08:31:00.000Z
synced_at: 2026-06-28
---
> 📅 **학습일**: 2023-07-05

1. Swiper

    npm install swiper


    npm install swiper@8.0.6


    ```typescript
    import { Swiper, SwiperSlide } from 'swiper/react';
    import 'swiper/swiper.min.css';
    
    const MySlider = () => {
      return (
        <Swiper>
          <SwiperSlide>Slide 1</SwiperSlide>
          <SwiperSlide>Slide 2</SwiperSlide>
          <SwiperSlide>Slide 3</SwiperSlide>
        </Swiper>
      );
    };
    
    export default MySlider;
    ```

1. fontawesome

    npm install @fortawesome/react-fontawesome @fortawesome/free-solid-svg-icons


    import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
    import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';


    <FontAwesomeIcon icon={faChevronLeft} />

1. Next UI

    npm i @nextui-org/reactq


    ```typescript
    import * as React from 'react';
    
    // 1. import `NextUIProvider` component
    import { NextUIProvider } from '@nextui-org/react';
    
    function App({ Component }) {
      // 2. Use at the root of your app
      return (
        <NextUIProvider>
          <Component />
        </NextUIProvider>
      );
    }
    ```

2. <ip주소>:3000/Detail
