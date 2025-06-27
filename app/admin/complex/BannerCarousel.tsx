"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Zoom } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/zoom";
import SkeletonCarousel from "./SkeletonCarousel";

interface Props {
    images: string[];
    onClickImage: () => void;
}

export default function BannerCarousel({ images, onClickImage }: Props) {
    return (
        <Swiper
            modules={[Navigation, Pagination, Zoom]}
            navigation
            pagination={{ clickable: true }}
            zoom
            loop
            className="w-full h-full"
        >
            {images.map((img, index) => (
                <SwiperSlide key={index}>
                    <div
                        className="swiper-zoom-container cursor-pointer"
                        onClick={onClickImage}
                    >
                        <img
                            src={img}
                            alt={`Imagen ${index + 1}`}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </SwiperSlide>
            ))}
        </Swiper>
    );
}
