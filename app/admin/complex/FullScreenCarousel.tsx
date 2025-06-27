import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Zoom } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/zoom";
import { X } from "lucide-react";

interface Props {
    open: boolean;
    onClose: () => void;
    images: string[];
}

export default function FullscreenCarousel({ open, onClose, images }: Props) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="md:!min-w-[700px] h-full md:h-[500px] max-w-full bg-[#1a1f2b] border-gray-800">
                <DialogClose className="absolute top-4 right-4 text-white cursor-pointer z-30 hover:text-gray-300">
                    <X className="z-20 h-5 w-5 text-white" />
                </DialogClose>
                <DialogHeader className="text-white px-4 pt-2">
                    <DialogTitle className="text-white">
                        Galería Completa
                    </DialogTitle>
                </DialogHeader>

                <Swiper
                    modules={[Navigation, Zoom]}
                    navigation
                    zoom
                    loop
                    className="w-full h-full"
                >
                    {images.map((img, idx) => (
                        <SwiperSlide key={idx}>
                            <div className="swiper-zoom-container">
                                <img
                                    src={img}
                                    alt={`img-${idx}`}
                                    className="w-full h-full object-contain"
                                />
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </DialogContent>
        </Dialog>
    );
}
