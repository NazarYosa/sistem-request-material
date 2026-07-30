// src/hooks/useMasterParts.js
//
// Pengganti langsung dari:
//   - useEffect fetch "master_parts" + realtime subscription
//   - handleSaveInput (upsert, + delete kalau key berubah)
//   - handleDeleteDb (delete)
// yang sebelumnya ada di App.jsx.
//
// Bentuk data yang dikembalikan SAMA PERSIS seperti masterDb lama:
// object { [id]: dataCamelCase }. Jadi semua komponen anak (InputView,
// ScanView, ManualReqView, PartInfoView, dst) tidak perlu diubah sama sekali.

import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase";
import { toDbRow, fromDbRow } from "../masterPartsMapper";

const QUERY_KEY = ["master_parts"];

// ---- fetch function ----
async function fetchMasterParts() {
  const { data: rows, error } = await supabase.from("master_parts").select("*");
  if (error) throw error;

  const data = {};
  rows.forEach((row) => {
    data[row.id] = fromDbRow(row);
  });
  return data;
}

export function useMasterParts() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchMasterParts,
  });

  // ---- realtime subscription: tetap sama persis logikanya,
  // bedanya sekarang update ke cache React Query, bukan ke useState ----
  useEffect(() => {
    const channel = supabase
      .channel("master_parts_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "master_parts" },
        (payload) => {
          queryClient.setQueryData(QUERY_KEY, (prev = {}) => {
            if (payload.eventType === "DELETE") {
              const next = { ...prev };
              delete next[payload.old.id];
              return next;
            }
            return {
              ...prev,
              [payload.new.id]: fromDbRow(payload.new),
            };
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // ---- mutation: save (upsert), termasuk kasus rename key (hapus key lama dulu) ----
  const saveMutation = useMutation({
    mutationFn: async ({ inputForm, newKey, editingKey }) => {
      if (editingKey && editingKey !== newKey) {
        const { error: delError } = await supabase
          .from("master_parts")
          .delete()
          .eq("id", editingKey);
        if (delError) throw delError;
      }
      const { error } = await supabase
        .from("master_parts")
        .upsert(toDbRow({ ...inputForm, id: newKey }));
      if (error) throw error;
      return { newKey, editingKey, inputForm };
    },
    onSuccess: ({ newKey, editingKey, inputForm }) => {
      // Optimistic-ish update langsung ke cache, sama seperti setMasterDb lama.
      // Realtime subscription di atas juga akan mengonfirmasi perubahan ini,
      // jadi tidak akan ada data yang tertinggal walau device lain juga ubah.
      queryClient.setQueryData(QUERY_KEY, (prev = {}) => {
        const next = { ...prev };
        if (editingKey && editingKey !== newKey) delete next[editingKey];
        next[newKey] = inputForm;
        return next;
      });
    },
  });

  // ---- mutation: delete ----
  const deleteMutation = useMutation({
    mutationFn: async (key) => {
      const { error } = await supabase.from("master_parts").delete().eq("id", key);
      if (error) throw error;
      return key;
    },
    onSuccess: (key) => {
      queryClient.setQueryData(QUERY_KEY, (prev = {}) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    },
  });

  return {
    masterDb: query.data ?? {},
    isLoadingDb: query.isLoading,
    saveMasterPart: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
    deleteMasterPart: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
