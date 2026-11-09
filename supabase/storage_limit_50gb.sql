-- Happy Time Connect: raise private storage bucket configured file limit to 50 GB
-- Run in Supabase SQL Editor. Actual uploads remain subject to your Supabase plan quota/maximum.
update storage.buckets
set file_size_limit = 53687091200
where id = 'htc-private';