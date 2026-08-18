import slotModel from "../models/slotModel.js"
import appointmentModel from "../models/appointmentModel.js"

// API to create slots for a doctor
const createSlots = async (req, res) => {
    try {

        const { docId, slots } = req.body

        if (!docId || !slots || !Array.isArray(slots) || slots.length === 0) {
            return res.json({ success: false, message: "Invalid slot data" })
        }

        // Validate all slots before creating
        const validSlots = slots.filter(slot => {
            return slot.date && slot.time && slot.consultationType
        })

        if (validSlots.length === 0) {
            return res.json({ success: false, message: "No valid slots provided" })
        }

        // Create slots with timestamp
        const slotsToCreate = validSlots.map(slot => ({
            docId,
            date: slot.date,
            time: slot.time,
            consultationType: slot.consultationType,
            isBooked: false,
            createdAt: Date.now()
        }))

        const createdSlots = await slotModel.insertMany(slotsToCreate, { ordered: false })

        res.json({
            success: true,
            message: `${createdSlots.length} slots created successfully`,
            slots: createdSlots
        })

    } catch (error) {
        console.log(error)
        
        // Handle duplicate key errors gracefully
        if (error.code === 11000) {
            return res.json({ success: false, message: "Some slots already exist" })
        }
        
        res.json({ success: false, message: error.message })
    }
}

// API to get available slots for a doctor
const getAvailableSlots = async (req, res) => {
    try {

        const { docId, date, consultationType } = req.body

        let filter = { docId, isBooked: false }

        // Filter by date if provided
        if (date) {
            filter.date = date
        }

        // Filter by consultation type if provided
        if (consultationType) {
            filter.consultationType = consultationType
        }

        const slots = await slotModel.find(filter).sort({ date: 1, time: 1 })

        res.json({
            success: true,
            slots,
            count: slots.length
        })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get all slots for a doctor (for management)
const getDoctorSlots = async (req, res) => {
    try {

        const { docId } = req.body

        const slots = await slotModel.find({ docId }).sort({ date: -1, time: 1 })

        // Count booked vs available
        const bookedCount = slots.filter(s => s.isBooked).length
        const availableCount = slots.filter(s => !s.isBooked).length

        res.json({
            success: true,
            slots,
            stats: {
                total: slots.length,
                booked: bookedCount,
                available: availableCount
            }
        })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to delete a slot
const deleteSlot = async (req, res) => {
    try {

        const { slotId, docId } = req.body

        const slot = await slotModel.findById(slotId)

        if (!slot) {
            return res.json({ success: false, message: "Slot not found" })
        }

        if (slot.docId !== docId) {
            return res.json({ success: false, message: "Unauthorized" })
        }

        if (slot.isBooked) {
            return res.json({ success: false, message: "Cannot delete a booked slot" })
        }

        await slotModel.findByIdAndDelete(slotId)

        res.json({ success: true, message: "Slot deleted successfully" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to mark a slot as booked when appointment is created
const markSlotBooked = async (req, res) => {
    try {

        const { slotId } = req.body

        const slot = await slotModel.findById(slotId)

        if (!slot) {
            return res.json({ success: false, message: "Slot not found" })
        }

        if (slot.isBooked) {
            return res.json({ success: false, message: "Slot already booked" })
        }

        await slotModel.findByIdAndUpdate(slotId, { isBooked: true, bookedBy: req.body.userId })

        res.json({ success: true, message: "Slot booked successfully" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to bulk create slots for a week
const createWeeklySlots = async (req, res) => {
    try {

        const { docId, startDate, endDate, times, consultationType } = req.body

        if (!docId || !startDate || !endDate || !times || !Array.isArray(times) || times.length === 0) {
            return res.json({ success: false, message: "Missing required fields" })
        }

        const start = new Date(startDate)
        const end = new Date(endDate)
        const slots = []

        // Generate slots for each day in range
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            // Skip Sundays (0)
            if (d.getDay() === 0) continue

            const dateStr = d.toISOString().split('T')[0]

            times.forEach(time => {
                slots.push({
                    docId,
                    date: dateStr,
                    time,
                    consultationType: consultationType || 'in-clinic',
                    isBooked: false,
                    createdAt: Date.now()
                })
            })
        }

        const createdSlots = await slotModel.insertMany(slots, { ordered: false })

        res.json({
            success: true,
            message: `${createdSlots.length} slots created for the week`,
            slots: createdSlots
        })

    } catch (error) {
        console.log(error)
        
        if (error.code === 11000) {
            return res.json({ success: false, message: "Some slots already exist" })
        }
        
        res.json({ success: false, message: error.message })
    }
}

export {
    createSlots,
    getAvailableSlots,
    getDoctorSlots,
    deleteSlot,
    markSlotBooked,
    createWeeklySlots
}
