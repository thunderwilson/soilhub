'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { Loader2, CheckCircle } from 'lucide-react'

const DynamicCheckmark = () => {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
      }}
    >
      <CheckCircle className="w-16 h-16 text-green-600" />
    </motion.div>
  )
}

export function DynamicSuccessPopup({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (isOpen: boolean) => void }) {
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isLoading) {
      timer = setTimeout(() => {
        setIsLoading(false)
      }, 1500)
    }
    return () => clearTimeout(timer)
  }, [isLoading])

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true)
      // Automatically close the popup after 4 seconds
      const closeTimer = setTimeout(() => setIsOpen(false), 4000)
      return () => clearTimeout(closeTimer)
    }
  }, [isOpen, setIsOpen])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-semibold">
            {isLoading ? 'Sending...' : 'Success!'}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-6">
          {isLoading ? (
            <Loader2 className="w-16 h-16 text-primary animate-spin" />
          ) : (
            <DynamicCheckmark />
          )}
          <DialogDescription className="text-center text-lg mt-4">
            {isLoading ? 'Please wait...' : 'Email sent successfully.'}
          </DialogDescription>
        </div>
      </DialogContent>
    </Dialog>
  )
}