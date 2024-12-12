import dayjs from "dayjs";
import Modal from "./common/Modal";
import { motion } from "framer-motion";

export default function StreamModal({ stream, onClose }: { stream: any, onClose: () => void }) {
    return (
        <Modal
            isOpen={!!stream}
            onClose={onClose}
            title={stream.name}
        >
            <motion.div
                className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto overflow-x-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                style={{ scrollbarWidth: 'none' }}
            >
                {stream.posts.map((post: any, idx: any) => (
                    <motion.div
                        key={idx}
                        className="p-4 border rounded-lg bg-orange/10 hover:shadow-md transition-shadow"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <h3 className="text-xl font-semibold mb-2 poppins">{post.title}</h3>
                        <p className="text-gray-600 mb-2">{post.content}</p>
                        <div className="text-sm text-gray-500">
                            <span>{post.author}</span> • <span>{dayjs(post.date).format('DD MMM YYYY')}</span>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </Modal>
    )
}