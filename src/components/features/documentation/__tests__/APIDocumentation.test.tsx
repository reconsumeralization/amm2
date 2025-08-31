import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { APIDocumentation } from '../APIDocumentation'
import { APIDocumentationSection } from '@/types/api-documentation'

const mockSections: APIDocumentationSection[] = []

describe('APIDocumentation', () => {
    it('renders API documentation with sections', () => {
        render(<APIDocumentation sections={mockSections} />)
    })
})
