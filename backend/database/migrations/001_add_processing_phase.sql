-- Migration 001: Add processing_phase tracking to datasets table
-- Run this manually on Supabase SQL editor, or it will auto-run on backend startup.
ALTER TABLE datasets
ADD COLUMN IF NOT EXISTS processing_phase VARCHAR(50) DEFAULT 'parsing';
